(function () {
    app.controller('defaultController', ['$scope', '$http', '$location', '_', 'FileUploader', '$sce',
        function ($scope, $http, $location, _, FileUploader, $sce) {
            $Ex.Http = $http;
            var ctrl = this;
            $scope.Ex = Ex;
            ctrl.personasFisicas = [];
            ctrl.personasMorales = [];
            ctrl.regimenFiscal = [];
            ctrl.informacionSAT = [];
            ctrl.mostrarRegimenes = false;
            ctrl.filter = { rfc: "", cfdi: "", usoCfdi: "" };
            ctrl.usoCfdisOriginales = usoCfdis;
            ctrl.usoCfdis = [];
            $scope.trustAsHtml = function (string) {
                return $sce.trustAsHtml(string);
            };

            ctrl.borraBusqueda = function () {
                ctrl.mostrarRegimenes = false;
                ctrl.personasFisicas = [];
                ctrl.personasMorales = [];
                ctrl.regimenFiscal = [];
                ctrl.informacionSAT = [];
                ctrl.razonSocial = "";
                ctrl.anexo = "";
                ctrl.getResultados = "";
                ctrl.usoCfdis = [];
                ctrl.totalErrores = 0;
            }

            ctrl.enviar = function () {
                if (ctrl.filter.rfc == "" || ctrl.filter.cfdi == "" || (ctrl.usoCfdis.length > 0 && (ctrl.filter.usoCfdi == "" || ctrl.filter.usoCfdi == undefined))) {
                    Ex.mensajes(Ex.GetResourceValue('msgCamposObligatorios'));
                    return;
                }

                ctrl.personasFisicas = [];
                ctrl.personasMorales = [];
                ctrl.informacionSAT = [];
                ctrl.mostrarRegimenes = false;
                var params = angular.copy(ctrl.filter);
                $Ex.Execute("Enviar", params, function (response, isInvalid) {
                    ctrl.filter.usoCfdi = params.usoCfdi;
                    if (!ctrl.validaInformacion(response.d.PersonasFisicas)) {
                        return
                    }
                    
                    if (response.d.PersonasFisicas.length > 0) {
                        ctrl.razonSocial = response.d.PersonasFisicas[0].RazonSocial;
                        ctrl.guardar(response.d.PersonasFisicas[0]);
                    }

                });

            }

            ctrl.validaInformacion = function (list) {

                if (list.length > 0) {
                    var item = list[0];
                    if (item.Regimenes != undefined) {
                        var regimenes = item.Regimenes.split("|");
                        if (regimenes.length > 1) {
                            ctrl.mostrarRegimenes = true;
                            for (var i = 0; i < regimenes.length; i++) {
                                ctrl.regimenFiscal.push({ Id: regimenes[i], Nombre: regimenes[i] });
                            }
                            ctrl.informacionSAT = list;
                            ctrl.razonSocial = list[0].RazonSocial;
                            Ex.mensajes(Ex.GetResourceValue('msgSeleccionarRegimenUsoCfdi'));
                            return false;
                        }
                        else if (regimenes.length == 1) {
                            ctrl.filter.regimenFiscal = regimenes[0]
                            ctrl.filtraUsoCfdi();
                            if ((ctrl.usoCfdis.length > 0 && (ctrl.filter.usoCfdi == "" || ctrl.filter.usoCfdi == undefined))) {
                                Ex.mensajes(Ex.GetResourceValue('msgSeleccionarUsoCFDI'));
                                return false;
                            }
                        }
                    }

                    if (item.MensajeError == "ACTUALIZAR") {
                        Ex.mensajes(Ex.GetResourceValue('msgActualizarInformacion'), 2, null, null, null, function () {
                            ctrl.guardar(item);

                        }, function () {

                        }, null);
                        return false;
                    }

                    if (item.MensajeError != undefined && item.MensajeError != "") {
                        Ex.mensajes(item.MensajeError);
                        return false;
                    }

                    return true;
                }
                return true;

            }

            ctrl.filtraUsoCfdi = function () {
                ctrl.usoCfdis = [];
                for (var i = 0; i < ctrl.usoCfdisOriginales.length; i++) {
                    if (ctrl.filter.regimenFiscal == ctrl.usoCfdisOriginales[i].RegimenFiscal) {
                        ctrl.usoCfdis.push({ Id: ctrl.usoCfdisOriginales[i].c_UsoCFDI, Nombre: ctrl.usoCfdisOriginales[i].UsoCFDI });
                    }
                    
                }
                
            }

            ctrl.guardar = function (item) {
                ctrl.informacionSAT = [];
                ctrl.personasFisicas = [];
                ctrl.personasMorales = [];
                $Ex.Execute("Guardar", item, function (response, isInvalid) {
                    item.MensajeError = "";
                    item.ErrorURL = false;
                    ; if (item.TipoPersona == "Física") {
                        ctrl.personasFisicas.push(item);
                    }
                    else {
                        ctrl.personasMorales.push(item);
                    }
                    Ex.mensajes(Ex.GetResourceValue('msgGuardadoExitoso'));
                });
            }

            ctrl.confirmar = function () {
                var message = "";
                if (ctrl.filter.regimenFiscal == undefined)
                    message = Ex.GetResourceValue('msgSeleccionarRegimen') + "\n";

                if (ctrl.filter.usoCfdi == "" || ctrl.filter.usoCfdi == undefined)
                    message += Ex.GetResourceValue('msgSeleccionarUsoCFDI')
                        

                if (message !="") {
                    Ex.mensajes(message);
                    return;
                }

                var item = {};

                if (ctrl.informacionSAT.length > 0)
                    item = ctrl.informacionSAT[0];
                if (ctrl.personasFisicas.length > 0)
                    item = ctrl.personasFisicas[0]
                if (ctrl.personasMorales.length > 0)
                    item = ctrl.personasMorales[0]

                item.Regimen = ctrl.filter.regimenFiscal;
                item.usoCfdi = ctrl.filter.usoCfdi;
                ctrl.guardar(item);

            }
       
            ctrl.descargarTemplate = function () {
                window.location = "DownLoadTemplate.aspx";
            }
            
            ctrl.uploadStart = function () {
                ctrl.filter = { rfc: "", cfdi: "", usoCfdi: "" }
                ctrl.borraBusqueda();
                Ex.load(true);
            }
            ctrl.uploaded = function (e, data) {

                Ex.load(false);
                ctrl.anexo = data.files[0].name;
                ctrl.personasFisicas = data.result.PersonasFisicas;
                var total = ctrl.personasFisicas.length 
                var erroresPersonasFisicas = _.filter(ctrl.personasFisicas, { ErrorURL: true });
                var totalErrores = erroresPersonasFisicas.length 
                var totalExitosos = total - totalErrores;
                ctrl.totalErrores = totalErrores;
                var mensaje = Ex.GetResourceValue('msgResultado').replace("#TOTAL#", total).replace("#EXITOSOS#", totalExitosos).replace("#ERRORES#", totalErrores);

                ctrl.getResultados = mensaje;
            };

            ctrl.uploader = new FileUploader({
                url: "../Code/UploadCargaMasiva.ashx"
            });

            ctrl.uploader.filters.push({
                name: 'maxFileSize',
                fn: function (item, options) {
                    var tamanioValido = (item.size / 1000000) < 20;
                    if (!tamanioValido) {
                        Ex.mensajes(Ex.GetResourceValue('msgTamanioInvalido'));
                    }
                    return tamanioValido;
                }
            });

            
            ctrl.descargarLogErrores = function () {

                var errores = [];

                for (var i = 0; i < ctrl.personasFisicas.length; i++) {
                    if (ctrl.personasFisicas[i].ErrorURL) {
                        errores.push({
                            RFC: ctrl.personasFisicas[i].RFC,
                            IDCFDI: ctrl.personasFisicas[i].IDCFDI,
                            usoCfdi: ctrl.personasFisicas[i].usoCfdi,
                            MensajeError: ctrl.personasFisicas[i].MensajeError.replaceAll("<br />", "|")
                        });
                    }
                }

                var log = JSON.stringify(errores);
                $("[id$=hdnErrores]").val(log)
            }

            ctrl.validarCliente = function () {
                if (ctrl.filter.cliente == undefined || ctrl.filter.cliente == "") {
                    Ex.mensajes(Ex.GetResourceValue('msgSeleccionarCliente'));
                    return;
                }
                
                $Ex.Execute("ValidaCliente", ctrl.filter, function (response, isInvalid) {
                    ctrl.filter = { rfc: "", cfdi: "", usoCfdi: "" }
                    ctrl.borraBusqueda();
                    if (response.d.length == 0) {
                        Ex.mensajes(Ex.GetResourceValue('msgNoExisteCliente'));
                        return;
                    }
                    else {
                        ctrl.razonSocial = response.d[0].RazonSocial
                        if (response.d[0].RFCRegistrado == null) {
                            ctrl.filter.rfc = response.d[0].RFC
                        }
                        else {
                            ctrl.filter = {
                                rfc: response.d[0].RFC,
                                cfdi: response.d[0].IDCIF,
                                usoCfdi: response.d[0].UsoCFDI
                            }
                            ctrl.enviar();
                        }
                    }

                });
            }

            ctrl.cerrarSesion = function () {
                $Ex.Execute("CerrarSesion", {}, function (response, isInvalid) {
                    window.location.href = "Login.aspx";
                }, {}, false);
            }
            
        }]);
})();