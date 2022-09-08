const express = require("express");
const router = express.Router();
const content = require("../models/content");
const user = require("../models/user");
const buy = require("../models/buy");
const subcontent = require("../models/subcontent");

router.get("/", ensureAuthenticated, (req, res, next) => {
  res.send("404 PAGE NOT FOUND!");
});

// content page
router.get("/:id", ensureAuthenticated, (req, res, next) => {
  // get user info
  let getUser = req.user;
  // find contents by ID
  content.findOne({ _id: req.params.id }, (err, contents) => {
    if (err) throw err;
    // find subcontents by foregin key
    subcontent.find({ contentID: contents._id }, (err, subcontents) => {
      if (err) throw err;
      // check if user purchased course or not
      buy.findOne(
        { contentID: req.params.id, studentID: getUser._id },
        (err, buys) => {
          if (err) throw err;
          if (buys == null) {
            buys = false;
          } else {
            buys = true;
          }

          res.render("content", {
            contents: contents,
            subcontents: subcontents,
            buys: buys,
          });
        }
      );
    });
  });
});

// check if user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/users/login");
}

// purchase course
router.post("/:id", (req, res, next) => {
  // get user and contentID of course
  let getUser = req.user;
  let contentID = req.body.contentID;

  req.checkBody("contentID", "شماره شناسایی دوره وارد نشده است.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    // find content ID for redirecting
    content.findOne({ _id: req.params.id }, (err, contents) => {
      if (err) throw err;

      req.flash("error", "اطلاعات مورد نظر را وارد کنید.");
      res.location(`/content/${contents._id}`);
      res.redirect(`/content/${contents._id}`);
    });
  } else {
    // find user
    user.findOne({ _id: getUser._id }, (err, user) => {
      if (err) throw err;
      // find content
      content.findOne({ _id: contentID }, (err, contents) => {
        if (err) {
          // if do not find the content show error
          req.flash("error", "شماره شناسایی نامعتبر است.");
          res.location(`/content/${contents._id}`);
          res.redirect(`/content/${contents._id}`);
        } else {
          // if find the content make new purchase
          let newBuy = new buy({
            contentID: contentID,
            contentName: contents.name,
            studentID: getUser._id,
            stdUsername: getUser.username,
            stdNumber: getUser.studentNumber,
          });

          // create new purchase
          buy.createBuy(newBuy, (err) => {
            if (err) throw err;
          });

          req.flash("success", "خرید دوره با موفقیت انجام شد.");
          res.location(`/content/${contents._id}`);
          res.redirect(`/content/${contents._id}`);
        }
      });
    });
  }
});

// exam page
router.get("/:id/:id", ensureAuthenticated, (req, res, next) => {
  // find exam
  subcontent.findOne({ _id: req.params.id }, (err, exams) => {
    if (err) throw err;
    if (exams === null) {
      next();
    } else {
      // find content for redirecting and post request route
      content.findOne({ _id: exams.contentID }, (err, contents) => {
        if (err) throw err;
        // get present time in miliseconds
        let startTime = new Date().getTime();
        // get end time of exam from database in miliseconds
        let endTime = new Date(exams.endTime).getTime();
        // create a countDown
        let timerFunc = setInterval(() => {
          let timeLeft = endTime - startTime;
          // calculate hours
          let hours = Math.floor(
            (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          // calculate minutes
          let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          // calculate seconds
          let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          // show full time
          let timer = hours + ":" + minutes + ":" + seconds;
          // check if time is finished
          if (timeLeft <= 0) {
            if (err) throw err;
            req.flash("error", "زمان آزمون به پایان رسیده است.");
            res.location(`/content/${contents._id}`);
            res.redirect(`/content/${contents._id}`);
          } else {
            console.log(timer);
            // find exam for getting exam name and post request route
            subcontent.findOne({ _id: req.params.id }, (err, exams) => {
              if (err) throw err;
              if (exams === null) {
                next();
              } else {
                res.render("exam", { exams: exams, contents: contents });
              }
            });
          }
          // destroy countDown
          clearInterval(timerFunc);
        }, 1000);
      });
    }
  });
});

// send exam name and score
router.post("/:id/:id", (req, res, next) => {
  let name = req.body.name;
  let score = req.body.score;

  req.checkBody("name", "نام آزمون وارد نشده است.").notEmpty();
  req.checkBody("score", "نمره آزمون وارد نشده است.").notEmpty();

  const errors = req.validationErrors();
  if (errors) {
    // find exam for redirecting
    subcontent.findOne({ _id: req.params.id }, (err, exams) => {
      if (err) throw err;
      if (exams === null) {
        next();
      } else {
        // find content for redirecting
        content.findOne({ _id: exams.contentID }, (err, contents) => {
          if (err) throw err;

          req.flash("error", "اطلاعات مورد نظر را وارد کنید.");
          res.location(`/content/${contents._id}/${exams._id}`);
          res.redirect(`/content/${contents._id}/${exams._id}`);
        });
      }
    });
  } else {
    // find exam by name
    subcontent.findOne({ name: name }, (err, result) => {
      // check if exam name exist
      if (err || result === null) {
        // find exam for redirecting
        subcontent.findOne({ _id: req.params.id }, (err, exams) => {
          if (err) throw err;
          if (exams === null) {
            next();
          } else {
            // find content for redirecting
            content.findOne({ _id: exams.contentID }, (err, contents) => {
              if (err) throw err;

              req.flash("error", "نام آزمون معتبر نیست");
              res.location(`/content/${contents._id}/${exams._id}`);
              res.redirect(`/content/${contents._id}/${exams._id}`);
            });
          }
        });
      } else {
        // check exam score is equal or more than 70
        if (score >= 70 && score < 100) {
          // find exam by name and update score
          subcontent.updateOne(
            { name: name },
            {
              score: score,
            },
            (err) => {
              if (err) throw err;
              // unlock next exam
              subcontent.updateOne(
                { prev: name },
                {
                  lock: false,
                },
                (err) => {
                  if (err) throw err;
                  // unlock next content
                  subcontent.updateOne(
                    { prev: name },
                    { lock: false },
                    (err) => {
                      if (err) throw err;

                      // find exam for redirecting
                      subcontent.findOne({ _id: req.params.id }, (err, exams) => {
                        if (err) throw err;
                        if (exams === null) {
                          next();
                        } else {
                          // find content for redirecting
                          content.findOne(
                            { _id: exams.contentID },
                            (err, contents) => {
                              if (err) throw err;

                              req.flash(
                                "success",
                                "تبریک! شما در این آزمون قبول شدید."
                              );
                              res.location(`/content/${contents._id}`);
                              res.redirect(`/content/${contents._id}`);
                            }
                          );
                        }
                      });
                    }
                  );
                }
              );
            }
          );
          // check if exam score is under 70
        } else if (score < 70 && score > 0) {
          // find exam by name and update score
          subcontent.updateOne(
            { name: name },
            {
              score: score,
            },
            (err) => {
              if (err) throw err;
              // lock next exam if unlocked or do nothing
              subcontent.updateOne(
                { prev: name },
                {
                  lock: true,
                },
                (err) => {
                  if (err) throw err;
                  // find exam for redirecting
                  subcontent.findOne({ _id: req.params.id }, (err, exams) => {
                    if (err) throw err;
                    if (exams === null) {
                      next();
                    } else {
                      // find content for redirecting
                      content.findOne(
                        { _id: exams.contentID },
                        (err, contents) => {
                          if (err) throw err;

                          req.flash(
                            "success",
                            "نیاز به تلاش بیشتر! شما در این آزمون قبول نشدید."
                          );
                          res.location(`/content/${contents._id}`);
                          res.redirect(`/content/${contents._id}`);
                        }
                      );
                    }
                  });
                }
              );
            }
          );
        } else {
          // chek if exam score is under 0 or more than 100
          // find exam for redirecting
          subcontent.findOne({ _id: req.params.id }, (err, exams) => {
            if (err) throw err;
            if (exams === null) {
              next();
            } else {
              // find content for redirecting
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
    });
  }
});

module.exports = router;
