import mongoose, { Schema, models, model } from "mongoose";

const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    userEmail: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Project =
  models.Project || model("Project", ProjectSchema);

export default Project;