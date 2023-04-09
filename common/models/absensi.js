'use strict';

module.exports = function (Absensi) {
    // disable some remote methods
    // Absensi.disableRemoteMethodByName('createChangeStream');
    // Absensi.disableRemoteMethodByName('count');
    // Absensi.disableRemoteMethodByName('exists');
    // Absensi.disableRemoteMethodByName('patchOrCreate');
    // Absensi.disableRemoteMethodByName('replaceOrCreate');
    // Absensi.disableRemoteMethodByName('findOne');
    // Absensi.disableRemoteMethodByName('destroyById');
    // Absensi.disableRemoteMethodByName('deleteById');
    // Absensi.disableRemoteMethodByName('replaceById');
    // Absensi.disableRemoteMethodByName('prototype.patchAttributes');
    // Absensi.disableRemoteMethodByName('prototype.__create__employee');
    // Absensi.disableRemoteMethodByName('prototype.__get__employee');
    // Absensi.disableRemoteMethodByName('prototype.__update__employee');
    // Absensi.disableRemoteMethodByName('prototype.__destroy__employee');
    // Absensi.disableRemoteMethodByName('upsertWithWhere');
    // Absensi.disableRemoteMethodByName('update');

    Absensi.observe('before save', function checkAbsensiType(ctx, next) {
        if (!ctx.isNewInstance) {
            return next();
        }

        const allowedTypes = ['hadir', 'izin', 'cuti', 'sakit'];
        if (!allowedTypes.includes(ctx.instance.type)) {
            const error = new Error('Invalid absensi type');
            error.statusCode = 400;
            error.code = 'INVALID_Absensi_TYPE';
            return next(error);
        }

        next();
    });

    Absensi.observe('before save', function checkCutiIzinApproval(ctx, next) {
        // ctx.instance.status = "oke";
        if (!ctx.isNewInstance) {
            return next();
        }

        const allowedTypes = ['izin', 'cuti'];
        if (allowedTypes.includes(ctx.instance.type)) {
            ctx.instance.status = "pending";
        }

        next();
    });

    // Set default date to today on create
    Absensi.observe('before save', function (ctx, next) {
        if (ctx.instance && !ctx.instance.date) {
            ctx.instance.date = new Date();
        }

        const time = new Date(ctx.instance.date).toLocaleTimeString('en',
                 { timeStyle: 'short', hour12: false, timeZone: 'UTC' });

        if (ctx.instance.type == 'hadir'&& time >=  '08:00') 
            {
                ctx.instance.type = 'telat';
                console.log("telat")
            }

        next();
    });

    // Absensi.observe('after save', function updateEmployeeAbsensi(ctx, next) {
    //     if (ctx.isNewInstance) {
    //         const Employee = Absensi.app.models.Employee;
    //         const employeeId = ctx.instance.employeeId;
    //         const absensiType = ctx.instance.type;
    //         const absensiDate = ctx.instance.date;

    //         const late = new Date(absensiDate).toLocaleTimeString('en',
    //              { timeStyle: 'short', hour12: false, timeZone: 'UTC' });

    //         Employee.findById(employeeId, function (err, employee) {
    //             if (err) {
    //                 return next(err);
    //             }

    //             if (absensiType === 'hadir') {
    //                 employee.hadir++;
    //             } else if (absensiType === 'sakit') {
    //                 employee.sakit++;
    //             }

    //             employee.save(next);
    //         });
    //     } else {
    //         next();
    //     }
    // });

    // list pending absensis for supervisor
    Absensi.pending = function (cb) {
        Absensi.find({ where: { status: 'pending' } }, cb);
    };
    Absensi.remoteMethod('pending', {
        http: { verb: 'get', path: '/pending' },
        returns: { arg: 'absensis', type: 'array', root: true },
    });

    // Get absensi report for an employee in a month
    Absensi.report = function (employeeId, month, cb) {
        var startDate = new Date(month);
        var endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        const allowedTypes = ['izin', 'cuti'];

        Absensi.find({
            where: {
                and: [
                    { date: { gte: startDate } },
                    { date: { lte: endDate } }
                ],
                employeeId: employeeId,
                // date: { gte: startDate, lte: endDate }
            }
        }, function (err, absensiList) {
            if (err) return cb(err);

            var report = {
                employeeId: employeeId,
                month: month,
                hadir: 0,
                telat: 0,
                sakit: 0,
                approvedIzinCutiCount: 0,
                rejectedIzinCutiCount: 0
            };

            // console.log(startDate);
            // console.log(endDate);
            // console.log(absensiList);

            absensiList.forEach(function (absensi) {
                if (absensi.status === 'sakit') {
                    report.sakit++;
                } else if (absensi.type === 'hadir') {
                    report.hadir++;
                }else if (absensi.type === 'telat') {
                    report.telat++;
                } else if (absensi.status === 'approved') {
                    if (allowedTypes.includes(absensi.type)) {
                        report.approvedIzinCutiCount++;
                    }
                } else if (absensi.status === 'rejected') {
                    if (allowedTypes.includes(absensi.type)) {
                        report.rejectedIzinCutiCount++;
                    }
                }
            });

            cb(null, report);
        });
    };
    Absensi.remoteMethod('report', {
        description: 'Get absensi report for an employee in a month',
        accepts: [
            { arg: 'id', type: 'string', required: true, description: 'Employee ID' },
            { arg: 'month', type: 'date', required: true, description: 'Date' }
        ],
        returns: { arg: 'report', type: 'object', root: true },
        http: { path: '/:id/report', verb: 'get' }
    });

    // approve an absensi by id
    Absensi.approve = function (id, cb) {
        Absensi.findById(id, function (err, absensi) {
            if (err) return cb(err);
            const Employee = Absensi.app.models.Employee;
            const employeeId = absensi.employeeId;

            Employee.findById(employeeId, function (err, employee) {
                if (err) {
                    return next(err);
                }

                if (absensi.type === 'izin') {
                    employee.izin++;
                } else if (absensi.type === 'cuti') {
                    employee.cuti++;
                }

                employee.save();
            });

            absensi.status = 'approved';
            absensi.save(cb);
        });
    };
    Absensi.remoteMethod('approve', {
        accepts: [
            { arg: 'id', type: 'string', required: true },
        ],
        http: { verb: 'post', path: '/:id/approve' },
        returns: { arg: 'absensi', type: 'object', root: true },
    });

    // reject an absensi by id
    Absensi.reject = function (id, cb) {
        Absensi.findById(id, function (err, absensi) {
            if (err) return cb(err);
            absensi.status = 'rejected';
            absensi.save(cb);
        });
    };
    Absensi.remoteMethod('reject', {
        accepts: [
            { arg: 'id', type: 'string', required: true },
        ],
        http: { verb: 'post', path: '/:id/reject' },
        returns: { arg: 'absensi', type: 'object', root: true },
    });




};