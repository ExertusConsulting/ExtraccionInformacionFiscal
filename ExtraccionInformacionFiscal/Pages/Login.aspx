<%@ Page Language="C#" AutoEventWireup="true" MasterPageFile="~/Site.Master" CodeBehind="Login.aspx.cs" Inherits="ExtraccionInformacionFiscal.Pages.Login" %>

<asp:Content ID="BodyContent" ContentPlaceHolderID="MainContent" runat="server">
    <div ng-controller="loginController as ctrl">



        <div class="row " id="dvRFC" style="display: none">

            <div class="col-sm-3">
            </div>
            <div class="col-sm-6 login-box ">
                <div class="row">
                    <div class="col-sm-12">
                        <span class="paso-login"><%= this.GetMessage("lblPaso1") %></span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-3 text-right">
                        <%= this.GetMessage("lblRFC") %>
                    </div>
                    <div class="col-sm-8">
                        <input type="text" ng-model="ctrl.login.rfc" class="form-control" maxlength="16" />
                    </div>
                    
                </div>
                <div class="row">
                    <div class="col-sm-12 text-right">
                        <button type="button" class="btn btn-default" ng-click="ctrl.validaRFC();">
                            <%= this.GetMessage("lblSiguiente") %>
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-sm-3">
            </div>
        </div>



        <div class="row" id="dvTelefono" style="display: none">
            <div class="col-sm-3">
            </div>
            <div class="col-sm-6 login-box">
                <div class="row">
                    <div class="col-sm-12">
                        <span class="paso-login"><%= this.GetMessage("lblPaso2") %></span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-3 text-right">
                        <%= this.GetMessage("lblTelefono") %>
                    </div>
                    <div class="col-sm-8">
                        <input type="text" ng-model="ctrl.login.telefono" class="form-control" maxlength="10"  />
                    </div>
                    
                </div>
                <div class="row">
                    <div class="col-sm-12 text-right">
                        <button type="button" class="btn btn-default" ng-click="ctrl.siguiente('#dvTelefono','#dvRFC','right','left')">
                            <%= this.GetMessage("lblRegresar") %>
                        </button>
                        &nbsp;&nbsp;&nbsp;
                        <button type="button" class="btn btn-default" ng-click="ctrl.enviaMensaje()">
                            <%= this.GetMessage("lblSiguiente") %>
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-sm-3">
            </div>

        </div>

        <div class="row" id="dvOTP" style="display: none">
            <div class="col-sm-3">
            </div>
            <div class="col-sm-6 login-box">
                <div class="row">
                    <div class="col-sm-12">
                        <span class="paso-login"><%= this.GetMessage("lblPaso3") %></span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-3 text-right">
                        <%= this.GetMessage("lblOTP") %>
                    </div>
                    <div class="col-sm-8">
                        <input type="text" ng-model="ctrl.login.codigo" class="form-control" maxlength="6" />
                    </div>
                    
                </div>
                <div class="row">
                    <div class="col-sm-12 text-right">
                        <button type="button" class="btn btn-default" ng-click="ctrl.siguiente('#dvOTP','#dvTelefono','right','left')">
                            <%= this.GetMessage("lblRegresar") %>
                        </button>
                        &nbsp;&nbsp;&nbsp;
                        <button type="button" class="btn btn-default" ng-click="ctrl.validaOTP()">
                            <%= this.GetMessage("lblSiguiente") %>
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-sm-3">
            </div>

        </div>

        <div class="row" id="dvAviso" style="display: none">
            <div class="col-sm-1">
            </div>

            <div class="col-sm-10" ng-include="'../Templates/AvisoPrivacidad.html'" style="overflow-x:auto; max-height:85vh; margin:20px">
            </div>

            <div class="col-sm-1">
            </div>
            <div class="col-sm-12 text-right" >
                <button type="button" class="btn btn-default" ng-click="ctrl.rechazar()">
                    <%= this.GetMessage("lblRechazar") %>
                </button>

                <button type="button" class="btn btn-default" ng-click="ctrl.aceptar()">
                    <%= this.GetMessage("lblAceptar") %>
                </button>
            </div>
        </div>



    </div>
    <script src="../Scripts/pages/login.js"></script>
</asp:Content>
