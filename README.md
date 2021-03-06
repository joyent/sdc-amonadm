<!--
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

<!--
    Copyright 2019 Joyent, Inc.
-->

# sdc-amonadm

This repository is part of the Joyent Triton project. See the [contribution
guidelines](https://github.com/joyent/triton/blob/master/CONTRIBUTING.md)
and general documentation at the main
[Triton project](https://github.com/joyent/triton) page.

This repo contains `amonadm`, which is the administrative tool that manages
probes and alarms for an SDC datacenter. If you are not familiar with Amon
already, refer to its [documentation](https://github.com/joyent/sdc-amon) for a
quick overview on it.

There is full documentation installed with it as a manpage, so in an sdc
deployment zone just do `man amonadm`.

# Development

    git clone git@github.com:joyent/sdc-amonadm.git
    cd sdc-amonadm
    make all
    node main.js

To update the man page, edit "docs/man/amonadm.md" and run `make pages`
to update "man/man1/amonadm.1".

# Testing

    npm test
