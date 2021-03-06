// Moves jQuery inclusion to code injection via ghost_foot
var _             = require('lodash'),
    Promise       = require('bluebird'),
    serverPath    = '../../../../',
    config        = require(serverPath + 'config'),
    models        = require(serverPath + 'models'),
    notifications = require(serverPath + 'api/notifications'),
    i18n          = require(serverPath + 'i18n'),

// These messages are shown in the admin UI, not the console, and should therefore be translated
    jquery = [
        i18n.t('notices.data.fixtures.canSafelyDelete'),
        '<script type="text/javascript" src="https://code.jquery.com/jquery-1.11.3.min.js"></script>\n\n'
    ],
    privacyMessage = [
        i18n.t('notices.data.fixtures.jQueryRemoved'),
        i18n.t('notices.data.fixtures.canBeChanged')
    ];

module.exports = function moveJQuery(options, logInfo) {
    var value;

    return models.Settings.findOne('ghost_foot').then(function (setting) {
        if (setting) {
            value = setting.attributes.value;
            // Only add jQuery if it's not already in there
            if (value.indexOf(jquery.join('')) === -1) {
                logInfo('Adding jQuery link to ghost_foot');
                value = jquery.join('') + value;

                return models.Settings.edit({key: 'ghost_foot', value: value}, options).then(function () {
                    if (_.isEmpty(config.privacy)) {
                        return Promise.resolve();
                    }
                    logInfo(privacyMessage.join(' ').replace(/<\/?strong>/g, ''));
                    return notifications.add({
                        notifications: [{
                            type: 'info',
                            message: privacyMessage.join(' ')
                        }]
                    }, options);
                });
            }
        }
    });
};
