/// <reference path="../../scripts/typings/angularjs/angular.d.ts" />
/// <reference path="../../scripts/typings/ui-router/angular-ui-router.d.ts" />
/// <reference path="ntbcenter.module.ts" />
(function () {
    'use strict';
    angular.module('ntbCenter').config(config);
    config.$inject = ['$stateProvider'];
    function config($stateProvider) {
        $stateProvider.state('loanCenter.loan.nettangible', {
            url: '/nettangible',
            views: {
                'nettangible': {
                    templateUrl: '/angular/ntbcenter/ntbcenter.html',
                    controller: 'ntbCenterController as ntbCenter'
                },
                'contextualBar@': {
                    templateUrl: '/angular/contextualbar/contextualbar.html',
                    controller: 'ContextualBarCtrl as contextualBarCtrl'
                }
            }
        }).state('loanCenter.loan.nettangible.details', {
            views: {
                'resultsSection': {
                    templateUrl: '/angular/ntbcenter/sections/results.html',
                }
            }
        });
    }
})();
//# sourceMappingURL=ntbcenter.routes.js.map