<%@ Page Title="Home Page" Language="C#" MasterPageFile="~/Site.Master" AutoEventWireup="true" CodeBehind="Default.aspx.cs" Inherits="ExtraccionInformacionFiscal._Default" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">

    <div ng-controller="defaultController as ctrl">
        <div class="row">
            <div class="col-sm-12" style="background-color: lightgray; height: 25px; font-weight: bold; font-size: 16px;">
                <%= this.GetMessage("lblTituloPantalla") %>
            </div>
            <asp:HiddenField ID="hdnErrores" runat="server" />
        </div>
        <br />
        <br />
        <div class="row">
            <div class="col-sm-6">
                <div class="row">
                    <div class="col-sm-2">
                        <%= this.GetMessage("lblCliente") %>:
                    </div>
                    <div class="col-sm-4">
                        <input type="text" class="form-control" ng-model="ctrl.filter.cliente" maxlength="16" ng-change="ctrl.borraBusqueda();" />
                    </div>
                    <div class="col-sm-3">
                        <button type="button" class="btn btn-default" ng-click="ctrl.validarCliente()">
                            <%= this.GetMessage("lblValidar") %>
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-sm-6 text-right">
                <button type="button" class="btn btn-default" ng-click="ctrl.cerrarSesion()">
                    <%= this.GetMessage("lblCerrarSesion") %>
                </button>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12">
                <h1 style="width: 100%; background-color: gray; min-height: 1px !important"></h1>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-6">
                <div class="row">
                    <div class="col-sm-12" style="font-weight: bold">
                        <%= this.GetMessage("lblIndividual") %>
                    </div>
                </div>
                <br />
                <div class="row">
                    <div class="col-sm-2">
                        <%= this.GetMessage("lblRFC") %>:
                    </div>
                    <div class="col-sm-4">
                        <input type="text" class="form-control" ng-model="ctrl.filter.rfc" maxlength="16" ng-change="ctrl.borraBusqueda()" />
                    </div>
                    <div class="col-sm-6">
                        <span>{{ctrl.razonSocial}}</span>
                    </div>

                </div>
                <div class="row">
                    <div class="col-sm-2">
                        <%= this.GetMessage("lblIdCIF") %>:
                    </div>
                    <div class="col-sm-4">
                        <input type="text" class="form-control" ng-model="ctrl.filter.cfdi" maxlength="11" ng-change="ctrl.borraBusqueda()" />
                    </div>

                </div>

                <div class="row" ng-show="ctrl.mostrarRegimenes">
                    <div class="col-sm-2">
                        <%= this.GetMessage("lblRegimenFiscal") %>:
                    </div>
                    <div class="col-sm-4">
                        <select class="form-control" ng-model="ctrl.filter.regimenFiscal"
                            ng-options="regimen.Id as regimen.Nombre for regimen in ctrl.regimenFiscal" ng-required="true" ng-change="ctrl.filtraUsoCfdi();">
                            <option value=""><span><%= this.GetMessage("lblSeleccionar") %></span></option>
                        </select>
                    </div>

                </div>
                <div class="row">
                    <div class="col-sm-2">
                        <%= this.GetMessage("lblUsoCFDI") %>:
                    </div>
                    <div class="col-sm-4">
                        <select class="form-control" ng-model="ctrl.filter.usoCfdi"
                            ng-options="usos.Id as usos.Nombre for usos in ctrl.usoCfdis" ng-required="true">
                            <option value=""><span><%= this.GetMessage("lblSeleccionar") %></span></option>
                        </select>
                    </div>
                    <div class="col-sm-3" ng-show="ctrl.mostrarRegimenes">
                        <button type="button" class="btn btn-default" ng-click="ctrl.confirmar()">
                            <%= this.GetMessage("lblConfirmar") %>
                        </button>
                    </div>
                    <div class="col-sm-3" ng-show="!ctrl.mostrarRegimenes">
                        <button type="button" class="btn btn-default" ng-click="ctrl.enviar()">
                            <%= this.GetMessage("lblEnviar") %>
                        </button>
                    </div>
                </div>
            </div>

            <div class="col-sm-6" ng-hide="true">
                <div class="row">
                    <div class="col-sm-6" style="font-weight: bold">
                        <%= this.GetMessage("lblMasivo") %>
                    </div>
                    <div class="col-sm-6" style="text-align: right">
                        <button type="button" class="btn btn-default" ng-click="ctrl.descargarTemplate()">
                            <%= this.GetMessage("lblDescargarTemplate") %>
                        </button>
                    </div>
                </div>
                <br />
                <div class="row">
                    <div class="col-sm-2">
                        <%= this.GetMessage("lblPath") %>:
                    </div>
                    <div class="col-sm-6">
                        <input type="text" class="form-control" ng-model="ctrl.anexo" disabled />
                    </div>
                    <div class="col-sm-2">
                        <input type="hidden" class="form-control" ng-model="ctrl.filter.Anexo" />
                        <upload
                            style="float: left;"
                            url="../Code/UploadCargaMasiva.ashx"
                            sesion-name="UploadCargaMasiva"
                            done="ctrl.uploaded(e,data)"
                            start="ctrl.uploadStart()"
                            ng-model="file"
                            btn-name="<%= this.GetMessage("lblSeleccionaArchivo") %>"
                            loading-label="<%= this.GetMessage("lblCargando") %>"
                            accept-file-types="(\.|\/)(xlsx|)$"
                            valid-files="Excel (xlsx)">
                        </upload>

                    </div>

                </div>
            </div>
        </div>
        <br />
        <div class="row">
            <div class="col-sm-3" style="font-size: 15px; font-weight: bold; padding-left: 0px">
                <%= this.GetMessage("lblResultadosSAT") %>
            </div>
            <div class="col-sm-9 " style="text-align: right">
                <span ng-bind-html="trustAsHtml(ctrl.getResultados)"></span>
            </div>
        </div>

        <div class="row" ng-show="ctrl.informacionSAT.length > 0">
            <span><%= this.GetMessage("lblConfirmacion") %></span>
            <div class="col-sm-12" style="overflow-x: auto">
                <table class="table table-condensed table-striped table-hover table-fixed" style="margin-bottom: 0px;">
                    <thead>
                        <tr>

                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvRazonSocial") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvNombreVialidad") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvNumeroExterior") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvColonia") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvMunicipio") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvEntidadFederativa") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvCP") %></span></th>
                            <th style="width: 300px; text-align: center"><span><%= this.GetMessage("gvRegimen") %></span></th>
                        </tr>
                    </thead>
                    <tbody style="max-height: 200px !important">
                        <tr ng-repeat="item in ctrl.informacionSAT">

                            <td style="width: 250px;">{{item.RazonSocial}}</td>
                            <td style="width: 250px;">{{item.NombreVialidad}}</td>
                            <td style="width: 150px;">{{item.NumeroExterior}}</td>
                            <td style="width: 250px;">{{item.Colonia}}</td>
                            <td style="width: 150px;">{{item.Municipio}}</td>
                            <td style="width: 150px;">{{item.EntidadFederativa}}</td>
                            <td style="width: 150px;">{{item.CP}}</td>
                            <td style="width: 300px;">{{item.Regimen}}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="row" ng-show="ctrl.personasFisicas.length > 0">
            <%--<span ><%= this.GetMessage("lblPersonasFisicas") %></span>--%>
            <div class="col-sm-12" style="overflow-x: auto">
                <table class="table table-condensed table-striped table-hover table-fixed" style="margin-bottom: 0px;">
                    <thead>
                        <tr>

                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvRazonSocial") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvNombreVialidad") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvNumeroExterior") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvColonia") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvMunicipio") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvEntidadFederativa") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvCP") %></span></th>
                            <th style="width: 300px; text-align: center"><span><%= this.GetMessage("gvRegimen") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvError") %></span></th>
                            <th style="width: 450px; text-align: center"><span><%= this.GetMessage("gvErrorMensaje") %></span></th>
                        </tr>
                    </thead>
                    <tbody style="max-height: 200px !important">
                        <tr ng-repeat="item in ctrl.personasFisicas" ng-style="{'background-color':item.ErrorURL? '#fac8c2':'#c2facb'}">

                            <td style="width: 250px;">{{item.RazonSocial}}</td>
                            <td style="width: 250px;">{{item.NombreVialidad}}</td>
                            <td style="width: 150px;">{{item.NumeroExterior}}</td>
                            <td style="width: 250px;">{{item.Colonia}}</td>
                            <td style="width: 150px;">{{item.Municipio}}</td>
                            <td style="width: 150px;">{{item.EntidadFederativa}}</td>
                            <td style="width: 150px;">{{item.CP}}</td>
                            <td style="width: 300px;">{{item.Regimen}}</td>
                            <td style="width: 150px; text-align: center">
                                <input type="checkbox" ng-model="item.ErrorURL" disabled /></td>
                            <td style="width: 450px;">
                                <span ng-bind-html="trustAsHtml(item.MensajeError)"></span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <%--<table class="table table-condensed table-striped table-hover table-fixed" style="margin-bottom: 0px; min-width: 2500px !important">
                    <thead>
                        <tr>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvRFC") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvIDCFDI") %></span></th>
                            <th style="width: 230px; text-align: center"><span><%= this.GetMessage("gvCURP") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvNombre") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvApellidoPaterno") %></span></th>

                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvApellidoMaterno") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvFechaNacimiento") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvFechaInicioOperaciones") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvSituacionContribuyente") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvFechaUltimoCambioSituacion") %></span></th>

                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvEntidadFederativa") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvMunicipio") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvColonia") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvTipoVialidad") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvNombreVialidad") %></span></th>

                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvNumeroExterior") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvNumeroInterior") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvCP") %></span></th>
                            <th style="width: 200px; text-align: center"><span><%= this.GetMessage("gvCorreo") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvAL") %></span></th>

                            <th style="width: 300px; text-align: center"><span><%= this.GetMessage("gvRegimen") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvFechaAlta") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvError") %></span></th>
                            <th style="width: 450px; text-align: center"><span><%= this.GetMessage("gvErrorMensaje") %></span></th>
                        </tr>
                    </thead>
                    <tbody style="max-height: 200px !important" >
                        <tr ng-repeat="item in ctrl.personasFisicas" ng-style="{'background-color':item.ErrorURL? '#fac8c2':'#c2facb'}">
                            <td style="width: 150px;">{{item.RFC}}</td>
                            <td style="width: 150px;">{{item.IDCFDI}}</td>
                            <td style="width: 230px;">{{item.CURP}}</td>
                            <td style="width: 250px;">{{item.Nombre}}</td>
                            <td style="width: 150px;">{{item.ApellidoPaterno}}</td>

                            <td style="width: 150px;">{{item.ApellidoMaterno}}</td>
                            <td style="width: 150px;">{{item.FechaNacimiento}}</td>
                            <td style="width: 150px;">{{item.FechaInicioOperaciones}}</td>
                            <td style="width: 150px;">{{item.SituacionContribuyente}}</td>
                            <td style="width: 150px;">{{item.FechaUltimoCambioSituacion}}</td>

                            <td style="width: 150px;">{{item.EntidadFederativa}}</td>
                            <td style="width: 150px;">{{item.Municipio}}</td>
                            <td style="width: 250px;">{{item.Colonia}}</td>
                            <td style="width: 250px;">{{item.TipoVialidad}}</td>
                            <td style="width: 250px;">{{item.NombreVialidad}}</td>

                            <td style="width: 150px;">{{item.NumeroExterior}}</td>
                            <td style="width: 150px;">{{item.NumeroInterior}}</td>
                            <td style="width: 150px;">{{item.CP}}</td>
                            <td style="width: 200px;">{{item.Correo}}</td>
                            <td style="width: 150px;">{{item.AL}}</td>

                            <td style="width: 300px;">{{item.Regimen}}</td>
                            <td style="width: 150px;">{{item.FechaAlta}}</td>
                            <td style="width: 150px; text-align:center">
                                <input type="checkbox" ng-model="item.ErrorURL" disabled /></td>
                            <td style="width: 450px;">
                                <span ng-bind-html="trustAsHtml(item.MensajeError)"></span>
                            </td>

                        </tr>

                    </tbody>
                </table>--%>
            </div>
        </div>
        <br />
        <div class="row">
            <div class="col-sm-12" style="text-align: right">
                <asp:LinkButton ID="lnkDescargaLog" runat="server" ng-if="ctrl.totalErrores>0" CssClass="btn btn-warning" OnClick="lnkDescargaLog_Click" ng-click="ctrl.descargarLogErrores();"><%= this.GetMessage("lblDescargarLogErrores") %></asp:LinkButton>

            </div>
        </div>
        <%--<br />--%>
        <%--<div class="row" ng-show="ctrl.personasMorales.length > 0">
            <span ><%= this.GetMessage("lblPersonasMorales") %></span>
            <div class="col-sm-12" style="overflow-x: auto" >
                <table class="table table-condensed table-striped table-hover table-fixed" style="margin-bottom: 0px; ">
                    <thead>
                        <tr>
                            
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvRazonSocial") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvNombreVialidad") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvNumeroExterior") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvColonia") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvMunicipio") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvEntidadFederativa") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvCP") %></span></th>
                            <th style="width: 300px; text-align: center"><span><%= this.GetMessage("gvRegimen") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvError") %></span></th>
                            <th style="width: 450px; text-align: center"><span><%= this.GetMessage("gvErrorMensaje") %></span></th>
                        </tr>
                    </thead>
                    <tbody style="max-height: 200px !important" >
                        <tr ng-repeat="item in ctrl.personasMorales" ng-style="{'background-color':item.ErrorURL? '#fac8c2':'#c2facb'}" >
                            
                            <td style="width: 250px;">{{item.RazonSocial}}</td>
                            <td style="width: 250px;">{{item.NombreVialidad}}</td>
                            <td style="width: 150px;">{{item.NumeroExterior}}</td>
                            <td style="width: 250px;">{{item.Colonia}}</td>
                            <td style="width: 150px;">{{item.Municipio}}</td>
                            <td style="width: 150px;">{{item.EntidadFederativa}}</td>
                            <td style="width: 150px;">{{item.CP}}</td>
                            <td style="width: 300px;">{{item.Regimen}}</td>
                            <td style="width: 150px; text-align:center">
                                <input type="checkbox" ng-model="item.ErrorURL" disabled /></td>
                            <td style="width: 450px;">
                                <span ng-bind-html="trustAsHtml(item.MensajeError)"></span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table class="table table-condensed table-striped table-hover table-fixed" style="margin-bottom: 0px; min-width: 2500px !important">
                    <thead>
                        <tr>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvRFC") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvIDCFDI") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvRazonSocial") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvRegimenCapital") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvFechaConstitucion") %></span></th>
                           
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvFechaInicioOperaciones") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvSituacionContribuyente") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvFechaUltimoCambioSituacion") %></span></th>

                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvEntidadFederativa") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvMunicipio") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvColonia") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvTipoVialidad") %></span></th>
                            <th style="width: 250px; text-align: center"><span><%= this.GetMessage("gvNombreVialidad") %></span></th>

                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvNumeroExterior") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvNumeroInterior") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvCP") %></span></th>
                            <th style="width: 200px; text-align: center"><span><%= this.GetMessage("gvCorreo") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvAL") %></span></th>

                            <th style="width: 300px; text-align: center"><span><%= this.GetMessage("gvRegimen") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvFechaAlta") %></span></th>
                            <th style="width: 150px; text-align: center"><span><%= this.GetMessage("gvError") %></span></th>
                            <th style="width: 450px; text-align: center"><span><%= this.GetMessage("gvErrorMensaje") %></span></th>
                        </tr>
                    </thead>
                    <tbody style="max-height: 200px !important" >
                        <tr ng-repeat="item in ctrl.personasMorales" ng-style="{'background-color':item.ErrorURL? '#fac8c2':'#c2facb'}">
                            <td style="width: 150px;">{{item.RFC}}</td>
                            <td style="width: 150px;">{{item.IDCFDI}}</td>
                            <td style="width: 250px;">{{item.RazonSocial}}</td>
                            <td style="width: 150px;">{{item.RegimenCapital}}</td>
                            <td style="width: 150px;">{{item.FechaConstitucion}}</td>
                            
                            <td style="width: 150px;">{{item.FechaInicioOperaciones}}</td>
                            <td style="width: 150px;">{{item.SituacionContribuyente}}</td>
                            <td style="width: 150px;">{{item.FechaUltimoCambioSituacion}}</td>

                            <td style="width: 150px;">{{item.EntidadFederativa}}</td>
                            <td style="width: 150px;">{{item.Municipio}}</td>
                            <td style="width: 250px;">{{item.Colonia}}</td>
                            <td style="width: 250px;">{{item.TipoVialidad}}</td>
                            <td style="width: 250px;">{{item.NombreVialidad}}</td>

                            <td style="width: 150px;">{{item.NumeroExterior}}</td>
                            <td style="width: 150px;">{{item.NumeroInterior}}</td>
                            <td style="width: 150px;">{{item.CP}}</td>
                            <td style="width: 200px;">{{item.Correo}}</td>
                            <td style="width: 150px;">{{item.AL}}</td>

                            <td style="width: 300px;">{{item.Regimen}}</td>
                            <td style="width: 150px;">{{item.FechaAlta}}</td>
                            <td style="width: 150px; text-align:center">
                                <input type="checkbox" ng-model="item.ErrorURL" disabled /></td>
                            <td style="width: 450px;">
                                <span ng-bind-html="trustAsHtml(item.MensajeError)"></span>
                            </td>

                        </tr>

                    </tbody>
                </table>
            </div>
        </div>--%>
    </div>
    <script src="../Scripts/pages/default.js"></script>
</asp:Content>
