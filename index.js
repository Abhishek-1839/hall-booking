const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

// In-memory storage
let rooms = [];
let bookings = [];

// Helper function to check if a room is available
const isRoomAvailable = (roomId, date, startTime, endTime) => {
  return !bookings.some(booking => 
    booking.roomId === roomId &&
    booking.date === date &&
    ((startTime >= booking.startTime && startTime < booking.endTime) ||
     (endTime > booking.startTime && endTime <= booking.endTime) ||
     (startTime <= booking.startTime && endTime >= booking.endTime))
  );
};
app.get('/', (req, res) => {
  res.send("Hello");});
// 1a. Create a Room
app.post('/rooms', (req, res) => {
  const { seats, amenities, pricePerHour } = req.body;
  const newRoom = {
    id: rooms.length + 1,
    seats,
    amenities,
    pricePerHour
  };
  rooms.push(newRoom);
  res.status(201).json(newRoom);
});

// 1b. Book a Room
app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  
  if (!isRoomAvailable(roomId, date, startTime, endTime)) {
    return res.status(400).json({ error: "Room is not available for the specified time" });
  }

  const newBooking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
    bookingDate: new Date().toISOString(),
    status: 'Confirmed'
  };
  bookings.push(newBooking);
  res.status(201).json(newBooking);
});

// 1c. List all Rooms with Booked Data
app.get('/rooms', (req, res) => {
  const roomsWithBookings = rooms.map(room => {
    const roomBookings = bookings.filter(booking => booking.roomId === room.id);
    return {
      ...room,
      bookings: roomBookings.map(booking => ({
        bookedStatus: booking.status,
        customerName: booking.customerName,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime
      }))
    };
  });
  res.json(roomsWithBookings);
});

// 1d. List all customers with booked Data
app.get('/customers', (req, res) => {
  const customersWithBookings = bookings.map(booking => {
    const room = rooms.find(room => room.id === booking.roomId);
    console.log('Booking:', booking);
    console.log('Room:', room);
    return {
      customerName: booking.customerName,
      roomName: room ? `Room ${room.id}` : 'Room not found',
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    };
  });
  res.json(customersWithBookings);
});

// 1e. List how many times a customer has booked the room with details
app.get('/customers/:name/bookings', (req, res) => {
  const customerName = req.params.name;
  const customerBookings = bookings.filter(booking => booking.customerName === customerName);
  
  const bookingsWithDetails = customerBookings.map(booking => {
    const room = rooms.find(room => room.id === booking.roomId);
    return {
      customerName: booking.customerName,
      roomName: `Room ${room.id}`,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      bookingId: booking.id,
      bookingDate: booking.bookingDate,
      bookingStatus: booking.status
    };
  });

  res.json({
    customerName,
    totalBookings: bookingsWithDetails.length,
    bookings: bookingsWithDetails
  });
});

app.listen(port, () => {
  console.log(`Hall Booking API listening at http://localhost:${port}`);
});
