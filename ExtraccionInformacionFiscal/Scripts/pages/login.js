(function () {
    app.controller('loginController', ['$scope', '$http', '$location', '_', 'FileUploader', '$sce',
        function ($scope, $http, $location, _, FileUploader, $sce) {
            $Ex.Http = $http;
            var ctrl = this;
            $scope.Ex = Ex;
            ctrl.login = {};
            setTimeout(function () {
                $("#dvRFC").effect("slide", { direction: "right" });
                
            }, 100)

            
            ctrl.validaRFC = function () {
                
                if (ctrl.login.rfc == undefined || ctrl.login.rfc == "") {
                    Ex.mensajes(Ex.GetResourceValue('msgSeleccionarRFC'));
                    return
                }
                
                $Ex.Execute("ValidaRFC", ctrl.login, function (response, isInvalid) {

                    if (response.d !== null) {
                        Ex.mensajes(response.d);
                        return;
                    }

                    ctrl.siguiente("#dvRFC", "#dvTelefono", "left", "right");
                    
                }, {}, false);
            }

            ctrl.enviaMensaje = function () {
                if (ctrl.login.telefono == undefined || isNaN(ctrl.login.telefono) || ctrl.login.telefono.length < 10) {
                    Ex.mensajes(Ex.GetResourceValue('msgSeleccionarTelefono'));
                    return;
                }

                Ex.mensajes(Ex.GetResourceValue('msgCodigoEnviado'), 2, null, null, null, function () {
                    $Ex.Execute("EnviaMensaje", ctrl.login, function (response, isInvalid) {
                        var result = response.d;
                        if (result.status) {
                            ctrl.siguiente("#dvTelefono", "#dvOTP", "left", "right");
                        }
                        else {
                            Ex.mensajes(result.mensaje);
                        }
                    }, {}, true);
                }, function () {

                }, null);
                
               
            }

            ctrl.validaOTP = function () {
                if (ctrl.login.codigo == undefined || isNaN(ctrl.login.codigo) || ctrl.login.codigo.length < 6) {
                    Ex.mensajes(Ex.GetResourceValue('msgSeleccionarOTP'));
                    return;
                }
                $Ex.Execute("ValidaOTP", ctrl.login, function (response, isInvalid) {
                    var result = response.d;
                    if (result.status) {
                        ctrl.siguiente("#dvTelefono", "#dvAviso", "left", "right")
                        
                        //ctrl.aceptar();
                    }
                    else {
                        Ex.mensajes(result.mensaje);
                        ctrl.siguiente("#dvOTP", "#dvTelefono", "right", "left");
                        
                    }

                }, {},true);
            }

            ctrl.aceptar = function () {
                $Ex.Execute("AceptarAviso", ctrl.login, function (response, isInvalid) {
                    window.location.href = "Default.aspx";
                }, {}, false);
            }

            ctrl.rechazar = function () {
                ctrl.login = {};
                ctrl.siguiente("#dvAviso", "#dvRFC", "right", "left");
            }

            ctrl.siguiente = function (divOcultar, divMostrar, de, hacia) {
                $(divOcultar).hide("slide", { direction: de });
                setTimeout(function () {
                    $(divMostrar).effect("slide", { direction: hacia });
                }, 500)
            }

        }]);
})();