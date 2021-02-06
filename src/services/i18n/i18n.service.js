const express = require('express');
const log = require('consola');

const Text = require('../../models/text.model');
const auth = require('../../middleware/jwt');
const { ERRORS } = require('../../config');

module.exports = {
  name: 'i18n',
  routes: {
    'GET /i18n/content': 'getTextsByTag',
    'GET /i18n/content/:key': 'getTextByKey',
    'POST /i18n/content': 'createText',
  },
  actions: {
    getTextByKey: {
      params: {
        key: 'string',
        $$strict: true,
      },
      async handler({ res, params }) {
        let text;
        try {
          text = await Text.findOne({ key: params.key }).exec();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        if (!text) {
          return res.status(404).send(ERRORS.NOT_FOUND);
        }

        res.send(text.safe());
      },
    },
    getTextsByTag: {
      params: {
        tag: 'string',
        $$strict: true,
      },
      async handler({ res, params }) {
        let texts;
        try {
          texts = await Text.find({ tag: params.tag }).exec();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }

        if (!texts) {
          return res.status(404).send(ERRORS.NOT_FOUND);
        }

        const response = {};

        for (const text of texts) {
          response[text.key] = text.value;
        }

        res.send(response);
      },
    },
    createText: {
      middleware: [express.json(), auth({ required: true })],
      params: {
        key: 'string',
        tag: 'string',
        value: 'string',
        $$strict: true,
      },
      async handler({ res, params }) {
        const text = new Text(params);
        try {
          text.save();
        } catch (err) {
          log.error(err);
          return res.status(500).send(ERRORS.GENERIC);
        }
        res.send(text.safe());
      },
    },
  },
};
