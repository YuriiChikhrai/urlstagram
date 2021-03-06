const { createReadStream } = require("fs");
const { join } = require("path");

const { Router } = require("express");
const Joi = require("@hapi/joi");

const Parser = require("./util/Parser.js");

const router = Router();
const parser = new Parser();

router.get("/", (req, res) => {
  res.render("home.nj", { title: "Urlstagram" });
});

router.get(/.(js|css)$/, (req, res) => {
  const { path } = req;
  const rs = createReadStream(join(__dirname, path));
  rs.pipe(res);
});

router.get("/url-parse", (req, res) => {
  const { query } = req;

  const { error } = Joi.object({
    url: Joi.string().required().uri(),
  }).validate(query);

  if (error) {
    res.status(400).send(error.details[0].message);
  }
  const url = decodeURIComponent(query.url);

  console.log("PARSING", url);
  parser
    .parse(url)
    .then((elemHandles) => {
      return Promise.all(
        elemHandles.map((elemHanle) => elemHanle.getAttribute("src"))
      );
    })
    .then((imgSources) => {
      res.render("home.nj", { data: imgSources });
    })
    .catch((err) => {
      throw new Error(err);
    });
});

module.exports = router;
