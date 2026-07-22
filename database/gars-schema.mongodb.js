// ---- 1. Select / create the database -------------------------
const DB_NAME = 'gars_db';
use(DB_NAME);

// ---- 2. Clean slate (comment these out once you have real data)
db.getCollection('users').drop();
db.getCollection('rooms').drop();
db.getCollection('devices').drop();
db.getCollection('bookings').drop();
db.getCollection('payments').drop();

// ================================================================
// USER
// ================================================================
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            title: 'User Validation',
            required: ['name', 'email', 'password', 'role', 'createdAt', 'updatedAt'],
            properties: {
                name: { bsonType: 'string', description: 'must be a string and is required' },
                email: { bsonType: 'string', pattern: '^.+@.+\\..+$', description: 'must be a valid email and is required' },
                password: { bsonType: 'string', description: 'hashed password, required' },
                role: { bsonType: 'string', enum: ['customer', 'admin', 'staff'], description: 'must be one of the enum values' },
                phone: { bsonType: 'string' },
                isVerified: { bsonType: 'bool' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
            }
        }
    },
    validationLevel: 'strict',
    validationAction: 'error'
});

// email must be unique (UK in the ERD)
db.getCollection('users').createIndex({ email: 1 }, { unique: true });

// ================================================================
// ROOM
// ================================================================
db.createCollection('rooms', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            title: 'Room Validation',
            required: ['name', 'type', 'pricePerHour', 'totalDevices', 'status', 'createdAt', 'updatedAt'],
            properties: {
                name: { bsonType: 'string' },
                type: { bsonType: 'string', enum: ['pc', 'console', 'vr', 'private'], description: 'room/category type' },
                description: { bsonType: 'string' },
                images: { bsonType: 'array', items: { bsonType: 'string' } },
                pricePerHour: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
                totalDevices: { bsonType: 'int', minimum: 0 },
                status: { bsonType: 'string', enum: ['active', 'inactive', 'maintenance'] },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
            }
        }
    },
    validationLevel: 'strict',
    validationAction: 'error'
});

// ================================================================
// DEVICE  (1 room -> many devices)
// ================================================================
db.createCollection('devices', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            title: 'Device Validation',
            required: ['roomId', 'deviceLabel', 'status', 'createdAt'],
            properties: {
                roomId: { bsonType: 'objectId', description: 'FK -> rooms._id' },
                deviceLabel: { bsonType: 'string' },
                status: { bsonType: 'string', enum: ['available', 'booked', 'maintenance'] },
                specs: { bsonType: 'string' },
                createdAt: { bsonType: 'date' }
            }
        }
    },
    validationLevel: 'strict',
    validationAction: 'error'
});

db.getCollection('devices').createIndex({ roomId: 1 });

// ================================================================
// BOOKING  (1 user -> many bookings, 1 room -> many bookings,
//           1 booking -> many reserved devices, 1 booking -> 1 payment)
// ================================================================
db.createCollection('bookings', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            title: 'Booking Validation',
            required: [
                'userId', 'roomId', 'bookingDate', 'startTime', 'endTime',
                'durationHours', 'totalPrice', 'status', 'paymentStatus',
                'createdAt', 'updatedAt'
            ],
            properties: {
                userId: { bsonType: 'objectId', description: 'FK -> users._id' },
                roomId: { bsonType: 'objectId', description: 'FK -> rooms._id' },
                deviceIds: { bsonType: 'array', items: { bsonType: 'objectId' }, description: 'FK -> devices._id (array)' },
                deviceCount: { bsonType: 'int', minimum: 0 },
                bookingDate: { bsonType: 'date' },
                startTime: { bsonType: 'string', description: "e.g. '18:00'" },
                endTime: { bsonType: 'string', description: "e.g. '20:00'" },
                durationHours: { bsonType: ['double', 'int'], minimum: 0 },
                totalPrice: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
                status: { bsonType: 'string', enum: ['pending', 'confirmed', 'completed', 'cancelled'] },
                paymentStatus: { bsonType: 'string', enum: ['unpaid', 'paid', 'refunded'] },
                paymentId: { bsonType: 'objectId', description: 'FK -> payments._id' },
                confirmationMessage: { bsonType: 'string' },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
            }
        }
    },
    validationLevel: 'strict',
    validationAction: 'error'
});

db.getCollection('bookings').createIndex({ userId: 1 });
db.getCollection('bookings').createIndex({ roomId: 1 });
db.getCollection('bookings').createIndex({ bookingDate: 1 });
// prevents a room from being double-booked for the exact same date/time slot
db.getCollection('bookings').createIndex(
    { roomId: 1, bookingDate: 1, startTime: 1 },
    { unique: true, partialFilterExpression: { status: { $in: ['pending', 'confirmed'] } } }
);

// ================================================================
// PAYMENT  (1 booking -> 1 payment)
// ================================================================
db.createCollection('payments', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            title: 'Payment Validation',
            required: ['bookingId', 'userId', 'amount', 'currency', 'status', 'createdAt', 'updatedAt'],
            properties: {
                bookingId: { bsonType: 'objectId', description: 'FK -> bookings._id' },
                userId: { bsonType: 'objectId', description: 'FK -> users._id' },
                amount: { bsonType: ['double', 'int', 'decimal'], minimum: 0 },
                currency: { bsonType: 'string' },
                paymentMethod: { bsonType: 'string', description: "e.g. 'card', 'stripe', 'cash'" },
                transactionId: { bsonType: 'string' },
                status: { bsonType: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
                createdAt: { bsonType: 'date' },
                updatedAt: { bsonType: 'date' }
            }
        }
    },
    validationLevel: 'strict',
    validationAction: 'error'
});

// enforce the 1-to-1 relationship: a booking can have only one payment
db.getCollection('payments').createIndex({ bookingId: 1 }, { unique: true });
db.getCollection('payments').createIndex({ userId: 1 });

// ================================================================
// Sample seed data — sanity check the validators end to end
// ================================================================
const now = new Date();

const userResult = db.getCollection('users').insertOne({
    name: 'Rim Al Mahmoud',
    email: 'rim@example.com',
    password: '$2b$10$examplehashedpasswordvalue',
    role: 'customer',
    phone: '+96170000000',
    isVerified: true,
    createdAt: now,
    updatedAt: now
});

const roomResult = db.getCollection('rooms').insertOne({
    name: 'VR Arena Room 1',
    type: 'vr',
    description: 'High-end VR room with 4 rigs',
    images: [],
    pricePerHour: 15,
    totalDevices: 4,
    status: 'active',
    createdAt: now,
    updatedAt: now
});

const deviceResult = db.getCollection('devices').insertOne({
    roomId: roomResult.insertedId,
    deviceLabel: 'VR-Rig-01',
    status: 'available',
    specs: 'Meta Quest 3, RTX 4080 PC',
    createdAt: now
});

const bookingResult = db.getCollection('bookings').insertOne({
    userId: userResult.insertedId,
    roomId: roomResult.insertedId,
    deviceIds: [deviceResult.insertedId],
    deviceCount: 1,
    bookingDate: now,
    startTime: '18:00',
    endTime: '20:00',
    durationHours: 2,
    totalPrice: 30,
    status: 'confirmed',
    paymentStatus: 'unpaid',
    confirmationMessage: 'Booking confirmed, see you at 6 PM!',
    createdAt: now,
    updatedAt: now
});

const paymentResult = db.getCollection('payments').insertOne({
    bookingId: bookingResult.insertedId,
    userId: userResult.insertedId,
    amount: 30,
    currency: 'USD',
    paymentMethod: 'stripe',
    transactionId: 'txn_example_123',
    status: 'completed',
    createdAt: now,
    updatedAt: now
});

// link the payment back onto the booking (1 booking - 1 payment)
db.getCollection('bookings').updateOne(
    { _id: bookingResult.insertedId },
    { $set: { paymentId: paymentResult.insertedId, paymentStatus: 'paid', updatedAt: new Date() } }
);

// ---- Verify -----------------------------------------------------
console.log('Collections created:', db.getCollectionNames());
db.getCollection('users').find();
db.getCollection('rooms').find();
db.getCollection('devices').find();
db.getCollection('bookings').find();
db.getCollection('payments').find();
