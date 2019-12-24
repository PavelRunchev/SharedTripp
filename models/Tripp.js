const mongoose = require('mongoose');

const trippSchema = new mongoose.Schema({
    startPoint: { type: mongoose.SchemaTypes.String, required: true },
    endPoint: { type: mongoose.SchemaTypes.String, required: true },
    date: { type: mongoose.SchemaTypes.String, required: true },
    time: { type: mongoose.SchemaTypes.String, required: true },
    seats: { type: mongoose.SchemaTypes.Number, required: true },
    description: { type: mongoose.SchemaTypes.String, required: true },
    carImage: { type: mongoose.SchemaTypes.String, required: true },
    buddies: { type: mongoose.SchemaTypes.ObjectId, ref: 'User', required: true }
});

const Tripp = mongoose.model('Tripp', trippSchema);

module.exports = Tripp;