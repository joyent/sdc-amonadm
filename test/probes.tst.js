/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/*
 * Copyright (c) 2019, Joyent, Inc.
 */

var bunyan = require('bunyan');
var fs = require('fs');
var path = require('path');
var sdc = require('sdc-clients');
var test = require("tap").test;

var amonadm = require('../lib');



///--- Globals

var AMON;
var APPLICATION;
var LOG = bunyan.createLogger({
    name: 'topo.tst',
    level: process.env.LOG_LEVEL || 'info',
    serializers: bunyan.stdSerializers,
    stream: process.stderr
});
var SAPI;
var VMAPI;
var AMON;
var PROBES_DIR = process.env.AMONADM_PROBES_DIR ||
    path.resolve(__dirname, 'probes');

///--- Tests

test('setup', function (t) {
    var f = process.env.AMONADM_CFG_FILE ||
        path.resolve(__dirname, '../etc/config.json');
    var cfg = JSON.parse(fs.readFileSync(f, 'utf8'));
    cfg.amon.log = LOG;
    cfg.sapi.log = LOG;
    cfg.sapi.version = '~2';
    cfg.vmapi.log = LOG;

    AMON = new sdc.Amon(cfg.amon);
    t.ok(AMON);

    SAPI = new sdc.SAPI(cfg.sapi);
    t.ok(SAPI);

    VMAPI = new sdc.VMAPI(cfg.vmapi);
    t.ok(VMAPI);

    var opts = {
        application: {
            name: 'sdc',
            role_key: 'smartdc_role'
        },
        log: LOG,
        sapi: SAPI,
        vmapi: VMAPI,
        amon: AMON,
        user: cfg.user
    };
    amonadm.load_application(opts, function (err, app) {
        t.ifError(err);
        t.ok(app);
        APPLICATION = app;
        t.end();
    });
});


test('list probes', function (t) {
    var opts = {
        amon: AMON,
        application: APPLICATION,
        log: LOG,
        sapi: SAPI,
        vmapi: VMAPI,
        user: 'admin'
    };
    amonadm.list_probes(opts, function (err, probes) {
        t.ifError(err);
        t.ok(probes);
        if (err || !probes) {
            t.end();
            return;
        }

        t.end();
    });
});


test('filter probes by role', function (t) {
    var opts = {
        amon: AMON,
        application: APPLICATION,
        log: LOG,
        sapi: SAPI,
        vmapi: VMAPI,
        role: ['imgapi'],
        user: 'admin'
    };
    amonadm.list_probes(opts, function (err) {
        t.ifError(err);

        amonadm.filter_probes(opts, function (err2, probes) {
            t.ifError(err2);
            t.ok(probes);
            t.ok(probes.length);

            probes.forEach(function (p) {
                t.equal(p.role, opts.role[0]);
            });

            t.end();
        });
    });
});


test('filter probes by machine', function (t) {
    var opts = {
        amon: AMON,
        application: APPLICATION,
        log: LOG,
        sapi: SAPI,
        vmapi: VMAPI,
        machine: [APPLICATION.roles.imgapi[0].uuid],
        user: 'admin'
    };
    amonadm.list_probes(opts, function (err, ps) {
        t.ifError(err);
        opts.probes = ps;
        amonadm.filter_probes(opts, function (err2, probes) {
            t.ifError(err2);
            t.ok(probes);
            t.ok(probes.length);

            probes.forEach(function (p) {
                t.equal(p.agent, opts.machine[0]);
            });

            t.end();
        });
    });
});


test('read probe files (all)', function (t) {
    var opts = {
        dir: PROBES_DIR,
        application: { name: 'sdc' },
        log: LOG
    };
    amonadm.read_probe_files(opts, function (err, probes) {
        t.ifError(err);
        t.ok(probes);
        if (err || !probes) {
            t.end();
            return;
        }
        t.ok(probes.vmapi);
        t.ok(Array.isArray(probes.vmapi));
        t.ok(probes.vmapi.length);
        t.ok(probes.imgapi);
        t.ok(Array.isArray(probes.imgapi));
        t.ok(probes.imgapi.length);
        t.end();
    });
});


test('read probe files (by role)', function (t) {
    var opts = {
        dir: PROBES_DIR,
        application: { name: 'sdc' },
        log: LOG,
        role: ['imgapi']
    };
    amonadm.read_probe_files(opts, function (err, probes) {
        t.ifError(err);
        t.ok(probes);
        if (err || !probes) {
            t.end();
            return;
        }

        t.notOk(probes.marlin);
        t.ok(probes.imgapi);
        t.ok(Array.isArray(probes.imgapi));
        t.ok(probes.imgapi.length);
        t.end();
    });
});


test('shutdown', function (t) {
    AMON.close();
    SAPI.close();
    VMAPI.close();
    t.end();
});
