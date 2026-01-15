import TimeSlot from '../models/timeslot.model.js';  

export const getBookedSlots = async (req, res) => {
    const { date, serviceType } = req.query;

    try {
        const bookedSlots = await TimeSlot.find({ date: new Date(date), serviceType })
            .select('slot');
        res.json(bookedSlots);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch booked slots' });
    }
};

export const bookTimeSlot = async (req, res) => {
    const { slot, date, serviceType } = req.body;

    try {
        const existingSlot = await TimeSlot.findOne({ slot, date: new Date(date), serviceType });

        if (existingSlot) {
            return res.status(400).json({ error: 'Slot already booked' });
        }

        const newBooking = new TimeSlot({ slot, date: new Date(date), serviceType });
        await newBooking.save();

        res.json({ message: "Time slot booked successfully" });
    } catch (err) {
        res.status(500).json({ error: 'Failed to book the slot' });
    }
};
