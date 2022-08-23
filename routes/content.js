const express = require("express");
const router = express.Router();
const course = require("../models/course");
const content = require("../models/content");
const user = require("../models/user");
const buy = require("../models/buy");
const exam = require("../models/exam");
const subcontent = require("../models/subcontent");
const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://midxdle:fFbE2DpWoxmGTAXF@cluster0.axsj3.mongodb.net";

router.get("/", ensureAuthenticated, (req, res, next) => {
  res.send("404 PAGE NOT FOUND!");
});

router.get("/:id", ensureAuthenticated, (req, res, next) => {
  content.findOne({ _id: req.params.id }, (err, contents) => {
    if (err) throw err;
    subcontent.find({ contentID: contents._id }, (err, subcontents) => {
      if (err) throw err;
      buy.findOne({ courseID: contents.courseID }, (err, buys) => {
        if (err) throw err;
        exam.find({ contentID: contents._id }, (err, exams) => {
          if (err) throw err;

          res.render("content", {
            contents: contents,
            subcontents: subcontents,
            buys: buys,
            exams: exams,
          });
        });
      });
    });
  });
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

router.post("/:id", (req, res, next) => {
  let courseID = req.body.courseID;
  let username = req.body.username;
  let password = req.body.password;

  req.checkBody("courseID", "شماره شناسایی دوره وارد نشده است.").notEmpty();
  req.checkBody("username", "نام کاربری وارد نشده است.").notEmpty();
  req.checkBody("password", "رمز عبور وارد نشده است").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    content.findOne({ _id: req.params.id }, (err, contents) => {
      if (err) throw err;

      req.flash("error", "اطلاعات مورد نظر را وارد کنید.");
      res.location(`/content/${contents._id}`);
      res.redirect(`/content/${contents._id}`);
    });
  } else {
    user.findOne({ username: username }, (err, user) => {
      if (err || user === null) {
        content.findOne({ _id: req.params.id }, (err, contents) => {
          if (err) throw err;

          req.flash("error", "نام کاربری نامعتبر است.");
          res.location(`/content/${contents._id}`);
          res.redirect(`/content/${contents._id}`);
        });
      } else {
        course.findOne({ _id: courseID }, (err, courses) => {
          if (err) {
            content.findOne({ _id: req.params.id }, (err, contents) => {
              if (err) throw err;

              req.flash("error", "شماره شناسایی نامعتبر است.");
              res.location(`/content/${contents._id}`);
              res.redirect(`/content/${contents._id}`);
            });
          } else {
            MongoClient.connect(uri, (err, db) => {
              if (err) throw err;
              let dbo = db.db("test");
              let data = {
                studentID: String(user._id),
                courseID: String(courses._id),
              };
              dbo.collection("buys").insertOne(data, (err) => {
                if (err) throw err;
                content.findOne({ _id: req.params.id }, (err, contents) => {
                  if (err) throw err;

                  req.flash("success", "خرید دوره با موفقیت انجام شد.");
                  res.location(`/content/${contents._id}`);
                  res.redirect(`/content/${contents._id}`);
                  db.close();
                });
              });
            });
          }
        });
      }
    });
  }
});

router.get("/:id/:id", ensureAuthenticated, (req, res, next) => {
  exam.findOne({ _id: req.params.id }, (err, exams) => {
    if (err) throw err;
    if (exams === null) {
      next();
    } else {
      content.findOne({ _id: exams.contentID }, (err, contents) => {
        if (err) throw err;

        res.render("exam", { exams: exams, contents: contents });
      });
    }
  });
});

router.post("/:id/:id", (req, res, next) => {
  let name = req.body.name;
  let score = req.body.score;

  req.checkBody("name", "نام آزمون وارد نشده است.").notEmpty();
  req.checkBody("score", "نمره آزمون وارد نشده است.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    exam.findOne({ _id: req.params.id }, (err, exams) => {
      if (err) throw err;
      if (exams === null) {
        next();
      } else {
        content.findOne({ _id: exams.contentID }, (err, contents) => {
          if (err) throw err;

          req.flash("error", "اطلاعات مورد نظر را وارد کنید.");
          res.location(`/content/${contents._id}/${exams._id}`);
          res.redirect(`/content/${contents._id}/${exams._id}`);
        });
      }
    });
  } else {
    exam.findOne({ name: name }, (err, result) => {
      if (err || result === null) {
        exam.findOne({ _id: req.params.id }, (err, exams) => {
          if (err) throw err;
          if (exams === null) {
            next();
          } else {
            content.findOne({ _id: exams.contentID }, (err, contents) => {
              if (err) throw err;
    
              req.flash("error", "نام آزمون معتبر نیست");
              res.location(`/content/${contents._id}/${exams._id}`);
              res.redirect(`/content/${contents._id}/${exams._id}`);
            });
          }
        });
      } else {
        if (score >= 70 && score < 100) {
          exam.updateOne(
            { name: name },
            {
              score: score,
            },
            (err) => {
              if (err) throw err;
              exam.updateOne(
                { prev: name },
                {
                  lock: false,
                },
                (err) => {
                  if (err) throw err;
                  subcontent.updateOne({ prev: name }, { lock: false }, (err) => {
                    if (err) throw err;
                  
                  exam.findOne({ _id: req.params.id }, (err, exams) => {
                    if (err) throw err;
                    if (exams === null) {
                      next();
                    } else {
                      content.findOne({ _id: exams.contentID }, (err, contents) => {
                        if (err) throw err;
    
                        req.flash("success", "تبریک! شما در این آزمون قبول شدید.");
                        res.location(`/content/${contents._id}`);
                        res.redirect(`/content/${contents._id}`);
                      });
                    }
                  });
                });
                }
              );
            }
          );
        } else if (score < 70 && score > 0) {
          exam.updateOne(
            { name: name },
            {
              score: score,
            },
            (err) => {
              if (err) throw err;
              exam.updateOne(
                { prev: name },
                {
                  lock: true,
                },
                (err) => {
                  if (err) throw err;
                  exam.findOne({ _id: req.params.id }, (err, exams) => {
                    if (err) throw err;
                    if (exams === null) {
                      next();
                    } else {
                      content.findOne({ _id: exams.contentID }, (err, contents) => {
                        if (err) throw err;
    
                        req.flash("success", "نیاز به تلاش بیشتر! شما در این آزمون قبول نشدید.");
                        res.location(`/content/${contents._id}`);
                        res.redirect(`/content/${contents._id}`);
                      });
                    }
                  });
                }
              );
            }
          );
        } else {
          exam.findOne({ _id: req.params.id }, (err, exams) => {
            if (err) throw err;
            if (exams === null) {
              next();
            } else {
              content.findOne({ _id: exams.contentID }, (err, contents) => {
                if (err) throw err;
    
                req.flash("error", "نمره وارد شده معتبر نیست.");
                res.location(`/content/${contents._id}/${exams._id}`);
                res.redirect(`/content/${contents._id}/${exams._id}`);
              });
            }
          });
        }
      }
    })
  }
});

module.exports = router;
