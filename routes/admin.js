const express = require("express");
const router = express.Router();
const course = require("../models/course");
const content = require("../models/content");
const user = require("../models/user");
const buy = require("../models/buy");
const exam = require("../models/exam");
const subcontent = require("../models/subcontent");

// admin page
router.get("/", ensureAuthenticated, (req, res, next) => {
  res.render("admin/admin", { title: "admin" });
});

// find registered users
router.get("/users", ensureAuthenticated, (req, res, next) => {
  user.find({}, (err, users) => {
    if (err) throw err;
    res.render("admin/user", { title: "users", users: users });
  });
});

// delete users
router.post("/users/:id", ensureAuthenticated, (req, res, next) => {
  user.deleteOne({ _id: req.params.id }, (err, result) => {
    if (err) throw err;
    console.log(result);

    req.flash("success", "دانشجوی مورد نظر حذف شد.");
    res.location("/admin/users");
    res.redirect("/admin/users");
  });
});

// find all courses and purchased courses
router.get("/courses", ensureAuthenticated, (req, res, next) => {
  course.find({}, (err, courses) => {
    if (err) throw err;
    buy.find({}, (err, buys) => {
      res.render("admin/course/course", {
        title: "courses",
        courses: courses,
        buys: buys,
      });
    });
  });
});

// adding courses page
router.get("/courses/add", ensureAuthenticated, (req, res, next) => {
  res.render("admin/course/add");
});

// add new course 
router.post("/courses/add", (req, res, next) => {
  let name = req.body.name;
  let details = req.body.details;
  let image = req.body.image;
  let price = req.body.price;

  // check empty fields
  req.checkBody("name", "نام کاربری وارد نشده است.").notEmpty();
  req.checkBody("details", "رایانامه وارد نشده است.").notEmpty();
  req.checkBody("image", "لینک تصویر مورد نظر را وارد کنید.").isURL();
  req
    .checkBody("price", "قیمت باید به صورت 99 هزار تومان وارد شود.")
    .isString();

  // show empty fields errors
  const errors = req.validationErrors();
  if (errors) {
    res.render("admin/course/add", {
      errors: errors,
    });
  } else {
    // make new course
    let newCourse = new course({
      name: name,
      details: details,
      image: image,
      price: price,
    });

    // save new course
    course.createCourse(newCourse, (err, course) => {
      if (err) throw err;
      // make new content
      let newContent = new content({
        courseID: course._id,
        name: course.name,
      });

      // save new content
      content.createContent(newContent, (err) => {
        if (err) throw err;
      });
    });

    req.flash("success", "دوره جدید با موفقیت ایجاد شد.");
    res.location("/admin/courses");
    res.redirect("/admin/courses");
  }
});

// editing course page
// find course by ID
router.get("/courses/edit/:id", ensureAuthenticated, (req, res, next) => {
  course.findOne({ _id: req.params.id }, (err, course) => {
    if (err) throw err;
    res.render("admin/course/edit", { course: course });
  });
});

// edit course
router.post("/courses/edit/:id", (req, res, next) => {
  let name = req.body.name;
  let details = req.body.details;
  let image = req.body.image;
  let price = req.body.price;

  req.checkBody("image", "لینک تصویر مورد نظر را وارد کنید.").isURL();
  req
    .checkBody("price", "قیمت باید به صورت 99 هزار تومان وارد شود.")
    .isString();

  const errors = req.validationErrors();
  if (errors) {
    course.findOne({ _id: req.params.id }, (err, course) => {
      if (err) throw err;

      req.flash(
        "error",
        "اطلاعات مورد نظر را به صورت صحیح وارد کنید. تصویر باید به صورت URL و قیمت به صورت 99 هزار تومان باشد."
      );
      res.location(`/admin/courses/edit/${course._id}`);
      res.redirect(`/admin/courses/edit/${course._id}`);
    });
  } else if (name == "" && details == "") {
    course.updateOne(
      { _id: req.params.id },
      {
        image: image,
        price: price,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/admin/courses");
        res.redirect("/admin/courses");
      }
    );
  } else if (name == "") {
    course.updateOne(
      { _id: req.params.id },
      {
        details: details,
        image: image,
        price: price,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/admin/courses");
        res.redirect("/admin/courses");
      }
    );
  } else if (details == "") {
    course.updateOne(
      { _id: req.params.id },
      {
        name: name,
        image: image,
        price: price,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/admin/courses");
        res.redirect("/admin/courses");
      }
    );
  } else {
    course.updateOne(
      { _id: req.params.id },
      {
        name: name,
        details: details,
        image: image,
        price: price,
      },
      (err) => {
        if (err) throw err;
        req.flash("success", "تغییرات با موفقیت ثبت شد");
        res.location("/admin/courses");
        res.redirect("/admin/courses");
      }
    );
  }
});

// delete courses
router.post("/courses/:id", ensureAuthenticated, (req, res, next) => {
  // delete course
  course.deleteOne({ _id: req.params.id }, (err, result) => {
    if (err) throw err;
    console.log(result, "course");
    // find related content
    content.findOne({ courseID: req.params.id }, (err, contents) => {
      if (err) throw err;
      // delete content
      content.deleteOne({ courseID: req.params.id }, (err, contentResult) => {
        if (err) throw err;
        console.log(contentResult, "content");
        // delete from purchased courses
        buy.deleteMany({ contentID: contents._id }, (err, buyResult) => {
          if (err) throw err;
          console.log(buyResult, "buy");
          // delete subcontents
          subcontent.deleteMany(
            { contentID: contents._id },
            (err, subResults) => {
              if (err) throw err;
              console.log(subResults, "subcontent");
              // delete exams
              exam.deleteMany(
                { contentID: contents._id },
                (err, examResult) => {
                  if (err) throw err;
                  console.log(examResult, "exam");
                  req.flash("success", "دوره مورد نظر حذف شد.");
                  res.location("/admin/courses");
                  res.redirect("/admin/courses");
                }
              );
            }
          );
        });
      });
    });
  });
});

router.get("/contents", ensureAuthenticated, (req, res, next) => {
  content.find({}, (err, contents) => {
    subcontent.find({}, (err, subcontents) => {
      if (err) throw err;
      res.render("admin/content/content", {
        title: "contents",
        contents: contents,
        subcontents: subcontents,
      });
    });
  });
});

router.get("/exams", ensureAuthenticated, (req, res, next) => {
  exam.find({}, (err, exams) => {
    if (err) throw err;
    res.render("admin/exam/exam", { title: "exams", exams: exams });
  });
});

// check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

module.exports = router;
