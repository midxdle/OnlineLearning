const express = require("express");
const router = express.Router();
const subcontent = require("../models/subcontent");

// teacher main page
router.get("/", ensureAuthenticated, (req, res, next) => {
  res.render("teacher/teacher", { title: "teacher" });
});

// show subcontents
router.get("/contents", ensureAuthenticated, (req, res, next) => {
  // find all subcontents
  subcontent.find({}, (err, subcontents) => {
    if (err) throw err;
    res.render("teacher/content/content", {
      title: "contents",
      subcontents: subcontents,
    });
  });
});

// adding subcontent page
router.get("/contents/add", ensureAuthenticated, (req, res, next) => {
  res.render("teacher/content/add");
});

// add subcontent
router.post("/contents/add", (req, res, next) => {
  let name = req.body.name;
  let contentID = req.body.contentID;
  let book = req.body.book;
  let pdf = req.body.pdf;
  let video = req.body.video;
  let lock = req.body.lock;
  let prev = req.body.prev;
  let score = req.body.score;
  let certificate = req.body.certificate;
  // get end DATE and TIME of exam and create ISO format(2022-12-12T23:23:00)
  let endDate = req.body.endDate;
  let endHour = req.body.endHour;
  let endTime = endDate + "T" + endHour;

  req.checkBody("name", "نام محتوا وارد نشده است.").notEmpty();
  req.checkBody("contentID", "شماره شناسایی محتوا وارد نشده است.").notEmpty();
  req
    .checkBody("lock", "به صورت ture یا false این قسمت را پر کنید.")
    .isBoolean();
  req.checkBody("prev", "نام محتوای قبلی را وارد کنید.").isString();
  req.checkBody("score", "نمره آزمون وارد نشده است.").notEmpty();
  req
    .checkBody(
      "certificate",
      "اگر این مدرک است این قسمت را true و در غیراینصورت false قرار دهید."
    )
    .isBoolean();
  req.checkBody("endDate", "تاریخ پایان آزمون را وارد کنید.").notEmpty();
  req.checkBody("endHour", "ساعت پایان آزمون را وارد کنید.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    res.render("teacher/content/add", {
      errors: errors,
    });
  } else {
    // make new subcontent
    let newSubContent = new subcontent({
      name: name,
      contentID: contentID,
      book: book,
      pdf: pdf,
      video: video,
      lock: lock,
      prev: prev,
      score: score,
      certificate: certificate,
      endTime: endTime,
    });

    // save new subcontent
    subcontent.createSubContent(newSubContent, (err) => {
      if (err) throw err;
    });

    req.flash("success", "محتوای جدید با موفقیت ایجاد شد.");
    res.location("/teacher/contents");
    res.redirect("/teacher/contents");
  }
});

// editing subcontent page
router.get("/contents/edit/:id", ensureAuthenticated, (req, res, next) => {
  // find the subcontent by ID
  subcontent.findOne({ _id: req.params.id }, (err, subcontent) => {
    if (err) throw err;
    res.render("teacher/content/edit", { subcontent: subcontent });
  });
});

// edit subcontent
router.post("/contents/edit/:id", (req, res, next) => {
  let name = req.body.name;
  let contentID = req.body.contentID;
  let book = req.body.book;
  let pdf = req.body.pdf;
  let video = req.body.video;
  let lock = req.body.lock;
  let prev = req.body.prev;
  let score = req.body.score;
  let certificate = req.body.certificate;
  // get end DATE and TIME of exam and create ISO format(2022-12-12T23:23:00)
  let endDate = req.body.endDate;
  let endHour = req.body.endHour;
  let endTime = endDate + "T" + endHour;

  req.checkBody("contentID", "شماره شناسایی محتوا وارد نشده است.").notEmpty();
  req
    .checkBody("lock", "به صورت ture یا false این قسمت را پر کنید.")
    .isBoolean();
  req.checkBody("prev", "نام محتوای قبلی را وارد کنید.").isString();
  req.checkBody("score", "نمره آزمون وارد نشده است.").notEmpty();
  req
    .checkBody(
      "certificate",
      "اگر این مدرک است این قسمت را true و در غیراینصورت false قرار دهید."
    )
    .isBoolean();
  req.checkBody("endDate", "تاریخ پایان آزمون را وارد کنید.").notEmpty();
  req.checkBody("endHour", "ساعت پایان آزمون را وارد کنید.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    // find subcontent for redirecting
    subcontent.findOne({ _id: req.params.id }, (err, subcontent) => {
      if (err) throw err;

      req.flash(
        "error",
        "شماره شناسایی، بستن دسترسی و یا نام محتوای قبلی وارد نشده اند."
      );
      res.location(`/teacher/contents/edit/${subcontent._id}`);
      res.redirect(`/teacher/contents/edit/${subcontent._id}`);
    });
    // reject empty fields and save the others
  } else if (name == "" && pdf == "" && book == "" && video == "") {
    subcontent.updateOne(
      { _id: req.params.id },
      {
        contentID: contentID,
        lock: lock,
        prev: prev,
        score: score,
        certificate: certificate,
        endTime: endTime,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/teacher/contents");
        res.redirect("/teacher/contents");
      }
    );
    // reject empty field and save the others
  } else if (name == "") {
    subcontent.updateOne(
      { _id: req.params.id },
      {
        name: name,
        contentID: contentID,
        book: book,
        pdf: pdf,
        video: video,
        lock: lock,
        prev: prev,
        score: score,
        certificate: certificate,
        endTime: endTime,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/teacher/contents");
        res.redirect("/teacher/contents");
      }
    );
    // reject empty fields and save the others
  } else if (pdf == "" && book == "" && video == "") {
    subcontent.updateOne(
      { _id: req.params.id },
      {
        name: name,
        contentID: contentID,
        lock: lock,
        prev: prev,
        score: score,
        certificate: certificate,
        endTime: endTime,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/teacher/contents");
        res.redirect("/teacher/contents");
      }
    );
    // save all
  } else {
    subcontent.updateOne(
      { _id: req.params.id },
      {
        name: name,
        contentID: contentID,
        book: book,
        pdf: pdf,
        video: video,
        lock: lock,
        prev: prev,
        score: score,
        certificate: certificate,
        endTime: endTime,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/teacher/contents");
        res.redirect("/teacher/contents");
      }
    );
  }
});

// delete subcontet
router.post("/contents/:id", ensureAuthenticated, (req, res, next) => {
  subcontent.deleteOne({ _id: req.params.id }, (err, result) => {
    if (err) throw err;
    console.log(result);

    req.flash("success", "محتوای مورد نظر حذف شد.");
    res.location("/teacher/contents");
    res.redirect("/teacher/contents");
  });
});

// exams page
router.get("/exams", ensureAuthenticated, (req, res, next) => {
  // find all exams
  subcontent.find({}, (err, exams) => {
    if (err) throw err;

    res.render("teacher/exam/exam", {
      title: "exams",
      exams: exams,
    });
  });
});

// check if user authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

module.exports = router;
