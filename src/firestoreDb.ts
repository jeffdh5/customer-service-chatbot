import * as admin from 'firebase-admin';

// Initialize Firebase Admin (you should replace this with your actual config)
if (!admin.apps.length) {
	admin.initializeApp({
		// Your Firebase Admin configuration object
		// credential: admin.credential.cert(serviceAccount),
		// databaseURL: 'https://your-project-id.firebaseio.com'
	});
}

const db = admin.firestore();

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any): Date => timestamp.toDate();

export async function getProductById(id: string) {
	const docRef = db.collection('products').doc(id);
	const docSnap = await docRef.get();
	return docSnap.exists ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function getOrderById(id: string) {
	const docRef = db.collection('orders').doc(id);
	const docSnap = await docRef.get();
	if (!docSnap.exists) return null;

	const orderData = { id: docSnap.id, ...docSnap.data() } as any;
	let customer = null;

	// Check if customerRef is a string (ID) or a reference
	if (typeof orderData.customerRef === 'string') {
		const customerSnap = await db.collection('customers').doc(orderData.customerRef).get();
		if (customerSnap.exists) {
			customer = { id: customerSnap.id, ...customerSnap.data() };
		}
	} else if (orderData.customerRef && typeof orderData.customerRef.get === 'function') {
		const customerSnap = await orderData.customerRef.get();
		if (customerSnap.exists) {
			customer = { id: customerSnap.id, ...customerSnap.data() };
		}
	}

	const orderItemsSnap = await docRef.collection('orderItems').get();
	const orderItems = await Promise.all(orderItemsSnap.docs.map(async (itemDoc) => {
		const itemData = itemDoc.data();
		const productSnap = await itemData.productRef.get();
		return {
			id: itemDoc.id,
			...itemData,
			product: { id: productSnap.id, ...productSnap.data() },
		};
	}));

	return {
		...orderData,
		customer,
		orderItems,
	};
}

export async function getRecentOrders(customerId: string, limitCount: number = 5) {
	const ordersRef = db.collection('orders');
	const q = ordersRef
		.where('customerId', '==', customerId)
		.orderBy('orderDate', 'desc')
		.limit(limitCount);
	const querySnapshot = await q.get();

	return Promise.all(querySnapshot.docs.map(async (doc) => {
		const orderData = { id: doc.id, ...doc.data() };
		const orderItemsSnap = await doc.ref.collection('orderItems').get();
		const orderItems = await Promise.all(orderItemsSnap.docs.map(async (itemDoc) => {
			const itemData = itemDoc.data();
			const productSnap = await itemData.productRef.get();
			return {
				id: itemDoc.id,
				...itemData,
				product: { id: productSnap.id, ...productSnap.data() },
				};
			}));
		return { ...orderData, orderItems };
	}));
}

export async function createEscalation(customerId: string, subject: string, description: string, threadId: string) {
	const escalationsRef = db.collection('escalations');
	const newEscalation = await escalationsRef.add({
		customerId,
		subject,
		description,
		threadId,
		status: 'OPEN',
		createdAt: admin.firestore.FieldValue.serverTimestamp(),
	});
	const newDoc = await newEscalation.get();
	return { id: newDoc.id, ...newDoc.data() };
}

export async function updateEscalationStatus(id: string, status: string) {
	const escalationRef = db.collection('escalations').doc(id);
	await escalationRef.update({ status });
	const updatedDoc = await escalationRef.get();
	return { id: updatedDoc.id, ...updatedDoc.data() };
}

export async function getCustomerByEmail(email: string) {
	const customersRef = db.collection('customers');
	const querySnapshot = await customersRef.where('email', '==', email).limit(1).get();
	
	if (querySnapshot.empty) {
		return null;
	}

	const customerDoc = querySnapshot.docs[0];
	return { id: customerDoc.id, ...customerDoc.data() };
}

export async function getRecentOrdersByEmail(email: string, limitCount: number = 5) {
	const customerSnapshot = await db.collection('customers').where('email', '==', email).limit(1).get();
	
	if (customerSnapshot.empty) {
		return [];
	}

	const customerId = customerSnapshot.docs[0].id;
	return getRecentOrders(customerId, limitCount);
}

export async function listProducts(limitCount: number = 10) {
	const productsRef = db.collection('products');
	const querySnapshot = await productsRef.limit(limitCount).get();

	return querySnapshot.docs.map(doc => ({
		id: doc.id,
		...doc.data()
	}));
}
