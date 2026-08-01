import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ingredientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    // Numeric so servings can be scaled (amount * factor). Use `note` for
    // anything that isn't a real quantity ("a pinch", "to taste").
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 60,
    },
  },
  { _id: false }
);

const instructionSchema = new Schema(
  {
    order: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { _id: false }
);

const nutritionalInfoSchema = new Schema(
  {
    calories: { type: Number, default: 0, min: 0 },
    protein: { type: Number, default: 0, min: 0 },
    carbs: { type: Number, default: 0, min: 0 },
    fat: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const recipeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    coverImage: {
      coverImageURL: {
        type: String,
        default:
          "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
      },
      coverImageFileId: {
        type: String,
      },
    },
    ingredients: {
      type: [ingredientSchema],
      required: true,
    },
    instructions: {
      type: [instructionSchema],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    // Premium-gated field per your freemium plan — left optional/undefined
    // by design, not populated with a default.
    nutritionalInfo: nutritionalInfoSchema,
    prepTime: {
      type: Number,
      required: true,
      min: 0,
    },
    cookTime: {
      type: Number,
      required: true,
      min: 0,
    },
    servings: {
      type: Number,
      required: true,
      min: 1,
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Easy", "Medium", "Hard"],
      index: true, // not covered by the compound index below (doesn't lead it)
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      // no field-level index: the {author, createdAt} compound below covers it
    },
    ratingAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

// Single text index — do NOT also set `text: true` on individual fields,
// Mongoose/MongoDB only allows one text index per collection.
recipeSchema.index(
  {
    title: "text",
    description: "text",
    "ingredients.name": "text",
    tags: "text",
  },
  {
    weights: { title: 5, tags: 3, "ingredients.name": 2, description: 1 },
  }
);

recipeSchema.index({ author: 1, createdAt: -1 });
recipeSchema.index({ tags: 1, difficulty: 1, prepTime: 1, cookTime: 1 });

export type RecipeDocument = InferSchemaType<typeof recipeSchema>;

export const Recipe: Model<RecipeDocument> =
  mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);
