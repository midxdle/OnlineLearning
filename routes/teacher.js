const express = require("express");
const router = express.Router();
const course = require("../models/course");
const content = require("../models/content");
const user = require("../models/user");
const buy = require("../models/buy");
const exam = require("../models/exam");
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
    res.render("teacher/content/content", { title: "contents", subcontents: subcontents });
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

  req.checkBody("name", "نام محتوا وارد نشده است.").notEmpty();
  req.checkBody("contentID", "شماره شناسایی محتوا وارد نشده است.").notEmpty();
  req.checkBody("lock", "به صورت ture یا false این قسمت را پر کنید.").isBoolean();
  req.checkBody("prev", "نام محتوای قبلی را وارد کنید.").isString();

  const errors = req.validationErrors();
  if (errors) {
    res.render("teacher/content/add", {
      errors: errors,
    });
  } else {
    // make new subcontent
    let newSubContent = new subcontent({
      name : name,
      contentID : contentID,
      book : book,
      pdf : pdf,
      video : video,
      lock : lock,
      prev : prev,
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

  req.checkBody("contentID", "شماره شناسایی محتوا وارد نشده است.").notEmpty();
  req.checkBody("lock", "به صورت ture یا false این قسمت را پر کنید.").isBoolean();
  req.checkBody("prev", "نام محتوای قبلی را وارد کنید.").isString();

  const errors = req.validationErrors();
  if (errors) {
    // find subcontent for redirecting
    subcontent.findOne({ _id: req.params.id }, (err, subcontent) => {
      if (err) throw err;

      req.flash("error", "شماره شناسایی، بستن دسترسی و یا نام محتوای قبلی وارد نشده اند.");
      res.location(`/teacher/contents/edit/${subcontent._id}`);
      res.redirect(`/teacher/contents/edit/${subcontent._id}`);
    });
    // reject empty fields and save the others
  } else if (name == "" && pdf == ""  && book == ""  && video == "") {
    subcontent.updateOne(
      { _id: req.params.id },
      {
        contentID : contentID,
        lock : lock,
        prev : prev,
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
        name : name,
        contentID : contentID,
        book : book,
        pdf : pdf,
        video : video,
        lock : lock,
        prev : prev,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/teacher/contents");
        res.redirect("/teacher/contents");
      }
    );
    // reject empty fields and save the others
  } else if (pdf == ""  && book == ""  && video == "") {
    subcontent.updateOne(
      { _id: req.params.id },
      {
        name : name,
        contentID : contentID,
        lock : lock,
        prev : prev,
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
        name : name,
        contentID : contentID,
        book : book,
        pdf : pdf,
        video : video,
        lock : lock,
        prev : prev,
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
  exam.find({}, (err, exams) => {
    if (err) throw err;
    
      res.render("teacher/exam/exam", {
        title: "exams",
        exams: exams,
      });
  });
});

// adding exam page
router.get("/exams/add", ensureAuthenticated, (req, res, next) => {
  res.render("teacher/exam/add");
});

// add exam
router.post("/exams/add", (req, res, next) => {
  let name = req.body.name;
  let score = req.body.score;
  let contentID = req.body.contentID;
  let lock = req.body.lock;
  let prev = req.body.prev;
  let certificate = req.body.certificate;
  // get end DATE and TIME of exam and create ISO format(2022-12-12T23:23:00)
  let endDate = req.body.endDate;
  let endHour = req.body.endHour;
  let endTime = endDate +"T"+ endHour;

  req.checkBody("name", "نام آزمون وارد نشده است.").notEmpty();
  req.checkBody("score", "نمره آزمون وارد نشده است.").notEmpty();
  req.checkBody("contentID", "شماره شناسایی آزمون وارد نشده است.").notEmpty();
  req.checkBody("lock", "به صورت ture یا false این قسمت را پر کنید.").isBoolean();
  req.checkBody("prev", "نام آزمون قبلی را وارد کنید.").isString();
  req.checkBody("certificate", "اگر این مدرک است این قسمت را true و در غیراینصورت false قرار دهید.").isBoolean();
  req.checkBody("endDate", "تاریخ پایان آزمون را وارد کنید.").notEmpty();
  req.checkBody("endHour", "ساعت پایان آزمون را وارد کنید.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    res.render("teacher/exam/add", {
      errors: errors,
    });
  } else {
    // make new exam
    let newExam = new exam({
      name : name,
      score: score,
      contentID : contentID,
      lock : lock,
      prev : prev,
      certificate: certificate,
      endTime: endTime,
    });

    // save new exam
    exam.createExam(newExam, (err) => {
      if (err) throw err;
    });

    req.flash("success", "آزمون جدید با موفقیت ایجاد شد.");
    res.location("/teacher/exams/");
    res.redirect("/teacher/exams/");
  }
});

// edit exams page
router.get("/exams/edit/:id", ensureAuthenticated, (req, res, next) => {
  // find exam by ID
  exam.findOne({ _id: req.params.id }, (err, exam) => {
    if (err) throw err;
    res.render("teacher/exam/edit", { exam: exam });
  });
});

// edit exam
router.post("/exams/edit/:id", (req, res, next) => {
  let name = req.body.name;
  let score = req.body.score;
  let contentID = req.body.contentID;
  let lock = req.body.lock;
  let prev = req.body.prev;
  let certificate = req.body.certificate;
  let endDate = req.body.endDate;
  let endHour = req.body.endHour;
  let endTime = endDate +"T"+ endHour;
  

  req.checkBody("contentID", "شماره شناسایی آزمون وارد نشده است.").notEmpty();
  req.checkBody("lock", "به صورت ture یا false این قسمت را پر کنید.").isBoolean();
  req.checkBody("prev", "نام آزمون قبلی را وارد کنید.").isString();
  req.checkBody("certificate", "اگر این مدرک است این قسمت را true و در غیراینصورت false قرار دهید.").isBoolean();
  req.checkBody("endDate", "تاریخ آزمون را وارد کنید.").notEmpty();
  req.checkBody("endHour", "ساعت آزمون را وارد کنید.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    // find exam for redirecting
    exam.findOne({ _id: req.params.id }, (err, exam) => {
      if (err) throw err;

      req.flash("error", "شماره شناسایی، بستن دسترسی، نام آزمون قبلی، مدرک، تاریخ پایان و یا تاریخ شروع وارد نشده اند.");
      res.location(`/teacher/exams/edit/${exam._id}`);
      res.redirect(`/teacher/exams/edit/${exam._id}`);
    });
    // reject empty fields and save the others
  } else if (name == "" && score == "") {
    exam.updateOne(
      { _id: req.params.id },
      {
        contentID : contentID,
        lock : lock,
        prev : prev,
        certificate: certificate,
        endTime: endTime,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/teacher/exams");
        res.redirect("/teacher/exams");
      }
    );
    // reject empty field and save the others
  } else if (name == "") {
    exam.updateOne(
      { _id: req.params.id },
      {
        score: score,
        contentID : contentID,
        lock : lock,
        prev : prev,
        certificate: certificate,
        endTime: endTime,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/teacher/exams");
        res.redirect("/teacher/exams");
      }
    );
    // reject empty field and save the others
  } else if (score == "") {
    exam.updateOne(
      { _id: req.params.id },
      {
        name : name,
        contentID : contentID,
        lock : lock,
        prev : prev,
        certificate: certificate,
        endTime: endTime,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/teacher/exams");
        res.redirect("/teacher/exams");
      }
    );
    // save all
  } else {
    exam.updateOne(
      { _id: req.params.id },
      {
        name : name,
        score: score,
        contentID : contentID,
        lock : lock,
        prev : prev,
        certificate: certificate,
        endTime: endTime,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/teacher/exams");
        res.redirect("/teacher/exams");
      }
    );
  }
});

// delete exam
router.post("/exams/:id", (req, res, next) => {
  exam.deleteOne({ _id: req.params.id }, (err, result) => {
    if (err) throw err;
    console.log(result);

    req.flash("success", "آزمون مورد نظر حذف شد.");
    res.location("/teacher/exams");
    res.redirect("/teacher/exams");
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
