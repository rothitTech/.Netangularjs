/// <reference path="../../../../../scripts/typings/angularjs/angular.d.ts" />
/// <reference path='../../../../../Scripts/typings/ui-router/angular-ui-router.d.ts'/>
/// <reference path="../../../consumer.service.ts" />
var docusign;
(function (docusign) {
    var ESigningRoomController = (function () {
        function ESigningRoomController($window, $state, docusignSVC, $sce, $timeout, authenticationContext, loanViewModel, $controller) {
            var _this = this;
            this.$window = $window;
            this.$state = $state;
            this.docusignSVC = docusignSVC;
            this.$sce = $sce;
            this.$timeout = $timeout;
            this.authenticationContext = authenticationContext;
            this.loanViewModel = loanViewModel;
            this.$controller = $controller;
            this.showESigningRoomIFrame = true;
            this.showSuccessRegion = false;
            this.showCoBorrowerRequiredRegion = false;
            this.showDeclineRegion = false;
            this.showRestartRegion = false;
            this.startOverMessage = "";
            this.setIFrameUrl = function (url) {
                var trustedUrl = _this.$sce.trustAsResourceUrl(url);
                _this.iframeSrc = trustedUrl;
                _this.docusignSVC.log('iframe url set to ' + trustedUrl);
            };
            this.finishedSigningHandler = function (event) {
                _this.docusignSVC.log('finishedSigningHandler() called with event "' + event + '".');
                //Hide the iFrame by all accounts
                _this.showESigningRoomIFrame = false;
                //Different Docusign Events
                //event = signing_complete  -this happens even if the first of two borrowers signed.
                //event = decline           -if this happens we have to void everything if anything was saved.
                //event = ttl_expired       -if the signing session was interrupted for any reason
                //event = viewing_complete  - when a borrower comes in to view the signing room that he already signed and clicks "Close".
                if (event != null) {
                    switch (event) {
                        case 'signing_complete':
                        case 'viewing_complete':
                            //This is the good one.  Call the handler to get the signed documents if both have now signed.
                            _this.showRegion("showSuccessRegion");
                            //this.$timeout(() => {
                            //    this.showSuccessRegion = true;
                            //}, 0);
                            var data = _this.authenticationContext;
                            var envelopeId = _this.docusignSVC.docusignSigningRoom.EnvelopeId;
                            _this.docusignSVC.post('securelink/HandleSigningComplete?EnvelopeId=' + envelopeId, data).then(function (response) {
                                if (response.ErrorMsg != null) {
                                    _this.showSuccessRegion = false;
                                    _this.startOverMessage = "There was an unexpected error.  Please restart the signing process by clicking the Restart button below.  If the problem persists please contact your loan officer.";
                                    _this.showRegion("showRestartRegion");
                                }
                                else {
                                    var message = response.Response;
                                    if (message != null) {
                                        if (message.ErrorCode === 1) {
                                            //This will alert the message that all signers have not signed
                                            //alert(message.Message);
                                            _this.showSuccessRegion = false;
                                            _this.showRegion("showCoBorrowerRequiredRegion");
                                        }
                                        else {
                                            if (message.ActionTaken === true) {
                                                //If action was taken on the server then reload the viewmodel and go to the appraisal screen
                                                _this.docusignSVC.refreshLoanViewModel().then(function () {
                                                    _this.openSuccessController();
                                                    _this.$state.go('docusign.appraisal');
                                                });
                                            }
                                            else {
                                                //Otherwise just go to the appraisal screen
                                                _this.$state.go('docusign.appraisal');
                                            }
                                        }
                                    }
                                }
                            });
                            break;
                        case 'decline':
                            _this.showRegion("showDeclineRegion");
                            //this.$timeout(() => {
                            //    this.showDeclineRegion = true;
                            //}, 0);
                            var data = _this.authenticationContext;
                            var envelopeId = _this.docusignSVC.docusignSigningRoom.EnvelopeId;
                            _this.docusignSVC.post('securelink/HandleSigningComplete?EnvelopeId=' + envelopeId, data).then(function (response) {
                                var message = response.Response;
                            });
                            break;
                        case 'ttl_expired':
                            _this.startOverMessage = "Your document has expired.  Please restart the signing process by clicking the Restart button below.";
                            _this.showRegion("showRestartRegion");
                            break;
                        case 'cancel':
                            _this.startOverMessage = "You have cancelled out of the signing room.  Please restart the signing process by clicking the Restart button below.";
                            _this.showRegion("showRestartRegion");
                            break;
                    }
                }
            };
            this.showRegion = function (regionName) {
                _this.$timeout(function () {
                    _this[regionName] = true;
                }, 0);
            };
            this.restart = function () {
                //Restart the signing room by navigating back to instructions screen
                _this.$state.go('docusign.esign.instructions');
            };
            this.finish = function () {
                //TODO: Go to the needs list if appraisal already complete
                _this.$state.go('docusign.appraisal');
            };
            this.openSuccessController = function () {
                var templateURL = '/angular/consumer/docusign/esigning/confirmation/success.esigning.html';
                _this.successController.openSuccessPopUp(templateURL);
            };
            this.successController = $controller('SuccessController');
            if (docusignSVC.docusignSigningRoom != null) {
                this.setIFrameUrl(docusignSVC.docusignSigningRoom.Url);
                //set callback in the global namespace so it is easier to connect with from child iFrame
                $window["SecureLinkDocusignComplete"] = function (message) {
                    _this.finishedSigningHandler(message);
                };
            }
            else {
                this.docusignSVC.log("No docusign Url was set.", "error");
                this.showESigningRoomIFrame = false;
                this.startOverMessage = "You're signing session was lost.  Please restart the signing process by clicking the Restart button below.";
                this.showRegion("showRestartRegion");
            }
            //Test code
            //this.setIFrameUrl("https://angularjs.org/");
            //this.setIFrameUrl("https://demo.docusign.net/restapi/v2/accounts/1019994");
            //this.setIFrameUrl("https://demo.docusign.net/Signing/startinsession.aspx?t=2d16a4cb-7ebd-4717-99b6-560c14c6bffa");
            //this.setIFrameUrl("https://demo.docusign.net/Signing/startinsession.aspx?t=25521dd9-0ee7-465d-9e54-4f5eb4a4cce2");
            //this.setIFrameUrl("https://demo.docusign.net/Signing/startinsession.aspx?t=1c6e4009-3ff6-42fa-97f0-8289dcb6d70d");
            //this.setIFrameHeight($window);
            //this.setIFrameUrl("https://demo.docusign.net/Signing/startinsession.aspx?t=a259cd66-d307-4ca3-b67b-c82cdadb1b9d");
            ////set callback in the global namespace so it is easier to connect with
            //$window["SecureLinkDocusignComplete"] = (message: any) => {
            //    this.finishedSigningHandler(message);
            //}
            //this.docusignSVC.log(this.iframeSrc);
        }
        ESigningRoomController.className = 'ESigningRoomController';
        ESigningRoomController.$inject = [
            '$window',
            '$state',
            'docusignSVC',
            '$sce',
            '$timeout',
            'authenticationContext',
            'loanViewModel',
            '$controller'
        ];
        return ESigningRoomController;
    })();
    docusign.ESigningRoomController = ESigningRoomController;
    angular.module('docusign').controller('ESigningRoomController', ESigningRoomController);
})(docusign || (docusign = {}));
//# sourceMappingURL=eSigningRoom.controller.js.map