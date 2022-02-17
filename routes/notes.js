const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const Note = require("../models/Note");

// ROUTE 1: Fetching all Note for the logged in user. : Login Required
router.get("/fetchallnotes", fetchUser, async (req, res) => {
  try {
    const note = await Note.find({ user: req.user.id });
    return res.json(note);
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ error: "Internal Server Error, try again later!" });
  }
});

//ROUTE 2: Creating a note : Login Required
router.post(
  "/createnote",
  fetchUser,
  [
    body("title", "Title must be min 3 characters").isLength({
      min: 3,
    }),
    body("description", "Description must be min 3 characters").isLength({
      min: 3,
    }),
  ],
  async (req, res) => {
    try {
      console.log(req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let note = await Note.create({
        user: req.user.id,
        title: req.body.title,
        description: req.body.description,
        tag: req.body.tag,
      });
      return res.json(note);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Internal Server Error, try again later!" });
    }
  }
);

//ROUTE 3: Update the note, login required.
router.put(
  "/updatenote/:id",
  fetchUser,
  // [
  //   body("title", "Title must be min 3 characters").isLength({
  //     min: 3,
  //   }),
  //   body("description", "Description must be min 3 characters").isLength({
  //     min: 3,
  //   }),
  // ],
  async (req, res) => {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   res.status(400).json({ errors: errors });
    // }
    const { title, description, tag } = req.body;
    let newNote = {};

    if (title) {
      newNote.title = title;
    }

    if (description) {
      newNote.description = description;
    }

    if (tag) {
      newNote.tag = tag;
    }

    try {
      let note = await Note.findById(req.params.id);

      if (!note) {
        return res.status(400).send("Note Not Found");
      }
      if (note.user.toString() !== req.user.id) {
        return res.status(401).send("Not Allowed");
      }
      note = await Note.findByIdAndUpdate(
        req.params.id,
        { $set: newNote },
        { new: true }
      );
      res.json(note);
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .send({ error: "Internal Server Error, try again later!" });
    }
  }
);

//ROUTE 4: Deleting a note. Login required

router.delete("/deletenote/:id", fetchUser, async (req, res) => {
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(400).send("Note Not Found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id);
    return res.json({ Success: "Note Deleted", note: note });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal Server Error, try again later!" });
  }
});

module.exports = router;
