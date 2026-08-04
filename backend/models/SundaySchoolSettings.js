import mongoose from 'mongoose';

const CLASS_NAMES = ['Beginners', 'Primary', 'Juniors', 'Seniors'];

const imageSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    caption: { type: String, trim: true },
  },
  { _id: false }
);

const sundaySchoolSettingsSchema = new mongoose.Schema(
  {
    title: { type: String, default: 'Sunday School' },
    description: {
      type: String,
      trim: true,
      default:
        'Every Sunday, our children grow in faith through age-appropriate Bible lessons, worship, and fun activities across four classes.',
    },

    // When & where Sunday School meets, shown as a single clear banner
    schedule: {
      day: { type: String, trim: true, default: 'Every Sunday' },
      time: { type: String, trim: true, default: '9:00 AM – 10:30 AM' },
      note: { type: String, trim: true }, // e.g. "Fellowship Hall, Ground Floor"
    },

    classes: [
      {
        name: { type: String, trim: true }, // e.g. Beginners
        ageRange: { type: String, trim: true }, // e.g. Ages 3-5
        time: { type: String, trim: true },
        teacher: { type: String, trim: true },
      },
    ],

    // Competitions, special events, celebrations
    events: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        date: Date,
        type: {
          type: String,
          enum: ['competition', 'event', 'celebration'],
          default: 'event',
        },
        // Which class this event/competition is for. Blank/omitted = all classes.
        class: { type: String, enum: [...CLASS_NAMES, ''], default: '' },
        image: imageSchema,
      },
    ],

    // Winners of past competitions
    winners: [
      {
        competitionTitle: { type: String, trim: true },
        category: { type: String, trim: true }, // e.g. "Bible Quiz - Juniors"
        date: Date,
        // Which class this competition was held for. Blank/omitted = all classes.
        class: { type: String, enum: [...CLASS_NAMES, ''], default: '' },
        groupImage: imageSchema,
        students: [
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SundayStudent',
    },

    name: {
      type: String,
      trim: true,
    },

    studentClass: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ['Boy', 'Girl'],
    },

    position: {
      type: String,
      enum: ['1st', '2nd', '3rd', 'Consolation Prize'],
      default: 'Consolation Prize',
    },

    image: imageSchema,
  },
],
      },
    ],

    // Christmas program info
    christmas: {
      title: { type: String, trim: true, default: 'Christmas Celebration' },
      date: Date,
      description: { type: String, trim: true },
      images: [imageSchema],
    },

    // General event photo gallery
    gallery: [
      {
        ...imageSchema.obj,
        event: { type: String, trim: true },
        date: Date,
      },
    ],

    image: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model('SundaySchoolSettings', sundaySchoolSettingsSchema);