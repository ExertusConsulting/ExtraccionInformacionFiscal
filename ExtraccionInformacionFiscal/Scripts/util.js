window["Exertus"] = {};

var _rfc_pattern_pm = "^(([A-Z&]{3})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|" +
                                            "(([A-Z&]{3})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|" +
                                            "(([A-Z&]{3})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|" +
                                            "(([A-Z&]{3})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$";
var _rfc_pattern_pf = "^(([A-Z&]{4})([0-9]{2})([0][13578]|[1][02])(([0][1-9]|[12][\\d])|[3][01])([A-Z0-9]{3}))|" +
                                     "(([A-Z&]{4})([0-9]{2})([0][13456789]|[1][012])(([0][1-9]|[12][\\d])|[3][0])([A-Z0-9]{3}))|" +
                                     "(([A-Z&]{4})([02468][048]|[13579][26])[0][2]([0][1-9]|[12][\\d])([A-Z0-9]{3}))|" +
                                     "(([A-Z&]{4})([0-9]{2})[0][2]([0][1-9]|[1][0-9]|[2][0-8])([A-Z0-9]{3}))$";

if (typeof (permisosPantalla) == 'undefined') {
    permisosPantalla = [];
}

var Ex = {
    version: "1.1",
    url: this.location.href,
    carga: null,
    valid: false,
    data: {},
    load: function (bolcarga, elemento) {
        try {
            if (bolcarga) {
                Ex.carga = new ajaxLoader($((elemento != undefined ? elemento : 'html')), { classOveride: 'bar', bgColor: '#333' });
            } else {
                if (Ex.carga) Ex.carga.remove();
            }
        }
        catch (e) {
            Ex.mensajes(e.message);
        }
    },
    request: function () {
        try {
            var manager = Sys.WebForms.PageRequestManager.getInstance();
            manager.add_beginRequest(OnBeginRequest);
            manager.add_endRequest(OnEndRequest);
        }
        catch (e) {
            Ex.mensajes(e.message);
        }
    },
    requeridos: function (id) {
        var valuebol = false;
        $(id + ' .requiredField').each(function () {
            Exertus.ValidateConstraint(this);
            if (jQuery.trim($(this).val()) == '') {
                $(this).addClass('RequiredField');
                valuebol = true;
                Ex.load(false);
            } else {
                $(this).removeClass('RequiredField');
                var email = document.getElementById($(this)[0].id).getAttribute("email") != null;
                if (email == true) {
                    if (ValidaEmail(jQuery.trim($(this).val())) == false) {
                        $(this).addClass('RequiredField');
                        valuebol = true;
                        Ex.load(false);
                    }
                }
            }
        });
        return valuebol;
    },
    isUndefined: function (variable) {
        return (typeof (variable) == 'undefined' || variable == null);
    },
    catcherror: function () {
        window.onerror = function (msg, url, line) {
            Ex.mensajes(msg);
        }
    },
    mensajes: function (Amsj, tipomsj, Atitle, AokText, AcancelText, AObj_OkConfirm, AObj_CancelConfirm, parametro) {
        try {
            if (tipomsj == null) tipomsj = 1;
            if (Atitle == null && tipomsj == 1) Atitle = Ex.GetGlobalResourceValue("Aviso") == '' ? 'Aviso' : Ex.GetGlobalResourceValue("Aviso");
            if (Atitle == null && tipomsj == 2) Atitle = Ex.GetGlobalResourceValue("Confirmacion") == '' ? 'Confirmación' : Ex.GetGlobalResourceValue("Confirmacion");
            if (AokText == null) AokText = Ex.GetGlobalResourceValue("Aceptar") == '' ? 'Aceptar' : Ex.GetGlobalResourceValue("Aceptar");
            if (AcancelText == null) { AcancelText = Ex.GetGlobalResourceValue("Cancelar") == '' ? 'Cancelar' : Ex.GetGlobalResourceValue("Cancelar") }
            $.alerts.okButton = AokText
            $.alerts.cancelButton = AcancelText
            switch (tipomsj) {
                case 1: //Avisos ó Mensajes
                    var arrReturn = new Array
                    jAlert(Amsj, Atitle, AObj_OkConfirm);
                    break;
                case 2: //Avisos que requieren confirmacion.
                    if (AObj_CancelConfirm == null) { AObj_CancelConfirm = CancelaConfirmacion }
                    if (AObj_OkConfirm == null || typeof (AObj_OkConfirm) != 'function') { alert('Falta indicar la funcion que ejecutara si se confirma el mensaje'); return false; }
                    if (AObj_CancelConfirm == null || typeof (AObj_CancelConfirm) != 'function') { alert('Falta indicar la funcion que ejecutara si se cancela el mensaje'); return false; }
                    jConfirm(Amsj, Atitle, function (r) {
                        if (r) {
                            if (parametro != null) {
                                AObj_OkConfirm(parametro)
                            } else {
                                AObj_OkConfirm()
                            }
                        }
                        else { AObj_CancelConfirm() }
                    });
                    break;
                case 3: //Sesion
                    if (window.parent) window.parent.location = aplicacionURL + 'pages/login.aspx';
                    break;
            }
        }
        catch (e) {
            alert(e);
        }
    },
    tooltip: function (m, t, w, h) {
        try {
            if (t == null) { t = '' }
            if (w == null) { w = 200 }
            if (h == null) { h = 0 }
            //Ejemplo: Ex.tooltip('Indica la medida en milimitros de la separación del punto mas alto de la hoja', 'Instrucciones', 200, 150);
            new Tip(m, t, t, w, w, h, h);
        }
        catch (e)
        { alert(e.message + ' \n[tooltip()]') }
    },
    clear: function (id) {
        if (Exertus.Binding) {
            if (Exertus.Binding.Clear) {
                Exertus.Binding.Clear();
            }
        }
    },
    autocomplete: function (nombre, id, url, data) {
        $("#" + nombre)[0].onkeydown = function () {
            Press(nombre, id);
        }
        $("#" + nombre).autocomplete({
            minLength: 3,
            disabled: false,
            source: function (request, response) {
                var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");

                var datosactual = (Ex.isUndefined(data) ? {} : data);
                //agregamos el campo actual....
                datosactual.TextoBusqueda = $("#" + nombre).val();

                $.ajax({
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    url: url,
                    data: JSON.stringify({ datos: datosactual }),
                    dataType: "json",
                    success: function (data) {
                        var data = jQuery.parseJSON(data.d);


                        response($.map(data, function (v, i) {
                            var text = v.Descripcion;
                            if (text && (!request.term || matcher.test(text))) {
                                return {
                                    label: v.Descripcion,
                                    value: v.ID
                                };
                            }
                        }));
                    },
                    error: function (result) {
                        responseText = jQuery.parseJSON(result.responseText);

                        if (response.status == 500) {
                            Ex.mensajes(responseText.Message);
                        }
                        else {
                            Ex.mensajes(responseText.Message);
                        }
                    }
                });
            },
            select: function (event, ui) {
                $("#" + nombre).val(ui.item.label);
                $("#" + id).val(ui.item.value);
                event.preventDefault();
            },
            change: function (event, ui) {
                if ($("#" + nombre).val() == "" || $("#" + id).val() == "") {
                    $("#" + id).val("");
                }
            },
            close: function () {
                if ($("#" + nombre).val() == "" || $("#" + id).val() == "") {
                    $("#" + id).val("");
                }
            }
        })
        /*
            .data("autocomplete")._renderItem = function (ul, item) {
            return $("<li>")
                    .data("item.autocomplete", item)
                    .append(item.label + "<br>" + item.value + "</a>")
                    .appendTo(ul); 
        }
        ;
        */
    },
    execute: function (p_metodo, p_data, p_callhandler, p_errorhandler, load) {
        try {
            if (load != undefined) { Ex.load(true); }
            $.ajax({
                type: "POST",
                data: JSON.stringify({ datos: (Ex.isUndefined(p_data) ? this.data : p_data) }),
                url: $(location).attr('pathname') + '/' + p_metodo,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Ex.isUndefined(p_callhandler) ? this.Sucess : p_callhandler),
                error: (Ex.isUndefined(p_errorhandler) ? this.Error : p_errorhandler)
            });
        }
        catch (e) {
            Ex.load(false);
            alert(e);
        }
    },
    executepath: function (p_path, p_metodo, p_data, p_callhandler, p_errorhandler) {
        try {
            $.ajax({
                type: "POST",
                data: JSON.stringify({ datos: (Ex.isUndefined(p_data) ? this.data : p_data) }),
                url: p_path + '/' + p_metodo,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Ex.isUndefined(p_callhandler) ? this.Sucess : p_callhandler),
                error: (Ex.isUndefined(p_errorhandler) ? this.Error : p_errorhandler)
            });
        }
        catch (e) {
            Ex.load(false);
            alert(e);
        }
    },
    GetResourceValue: function (key) {
        if (typeof (recursos) != 'undefined') {
            for (var index = 0; index < recursos.length; index++) {
                var entity = recursos[index];

                if (entity.Key == key) {
                    return entity.Value;
                }
            }
        }

        return '';
    },
    GetGlobalResourceValue: function (key) {
        if (typeof (recursosGlobal) != 'undefined') {
            for (var index = 0; index < recursosGlobal.length; index++) {
                var entity = recursosGlobal[index];

                if (entity.Key == key) {
                    return entity.Value;
                }
            }
        }

        return '';
    },
    GetDefaultSettingsJsGrid: function () {
        var gridSettings = {
            id: "",
            height: "95%",
            width: "99%",
            sorting: false,
            pageSize: 20, //Default for DRP as Jupiter
            paging: true,
            noDataContent: Ex.GetGlobalResourceValue("msgGridSinInformacion") == '' ? "No se encontró información para mostrar." : Ex.GetGlobalResourceValue("msgGridSinInformacion"),
            pagerFormat: "{first} {pages} {last} &nbsp;&nbsp; " + Ex.GetGlobalResourceValue("lblPagesGrid")  + " {pageIndex} " +  Ex.GetGlobalResourceValue("lblPagesOfGrid") + " {pageCount}",
            pagePrevText: "<i class=\"icon-step-backward\"></i>",
            pageNextText: "<i class=\"icon-step-forward\"></i>",
            pageFirstText: "<i class=\"icon-backward\"></i>",
            pageLastText: "<i class=\"icon-forward\"></i> ",
            pageNavigatorNextText: "<i class=\"icon-step-forward\"></i> ",
            pageNavigatorPrevText: "<i class=\"icon-step-backward\"></i>",
            pageButtonCount: 10,
            loadMessage: Ex.GetGlobalResourceValue("msgGridLoading"),
            autoload: true,
            selecting: false,
            data: []
        };

        return gridSettings;
    },
    EsTienePermisosObjeto: function (objetoID) {
        if (typeof (permisosPantalla) != 'undefined') {
            for (var index = 0; index < permisosPantalla.length; index++) {
                var entity = permisosPantalla[index];

                if (entity.ModuloID == objetoID) {
                    return true;
                }
            }
        }

        return false;
    },
    CustomAutocomplete: function (nombre, url, copyToControls, propertiesToShow, data, dynamicFilters, beforehandleSelection, handleSelection, btnBusquedaID) {

        $("[id$=" + nombre + "]").CustomAutocomplete({
            GetDataUrl: url,
            Filter: data,
            //PropertyKeyName: "CiudadID",
            CopyToControls: copyToControls,
            PropertiesToShow: propertiesToShow,
            TooManyResultsMessage: Ex.GetGlobalResourceValue("mensajeMuchosResultadosAutocomplete") == '' ? '(***solo se mostrarán los primeros 15 registros de la búsqueda***)' : Ex.GetGlobalResourceValue("mensajeMuchosResultadosAutocomplete"),
            ShowHeader: true,
            ItemCss: 'renglon_AutoComplete',
            AlternateItemCss: 'renglonalterno_AutoComplete',
            HeaderCss: 'headerGridView_AutoComplete',
            MessageCss: 'renglon_manyItmes',
            HandleSelection: typeof (handleSelection) == 'function' ? handleSelection : null,
            BeforeHandleSelection: typeof (beforehandleSelection) == 'function' ? beforehandleSelection : null,
            DynamicFilters: typeof (dynamicFilters) == 'undefined' ? [] : dynamicFilters,
            ButtonSearchID: typeof (btnBusquedaID) == 'undefined' ? '' : btnBusquedaID
        });

    },
    CustomAutocompleteSearchClick: function (nombre) {
        var input = $("[ID$=" + nombre + "]");

        // when i put breakpoint here, and my focus is not on input, 
        // then this if steatment is false????
        if (input.autocomplete("widget").is(":visible")) {
            input.autocomplete("close");
            return;
        }


        // work around a bug (likely same cause as #5265)
        $(this).blur();

        // pass empty string as value to search for, displaying all results
        input.autocomplete("search", "%%%");
        input.focus();

        if (typeof (event.stopImmediatePropagation) != 'undefined') {
            event.stopImmediatePropagation();
        }
    },
    AvoidCapture: function (elementID) {
        var input = $("[ID$=" + elementID + "]")[0];

        input.setAttribute("disabled", "disabled");
    },
    EnableCapture: function (elementID) {
        var input = $("[ID$=" + elementID + "]")[0];
        input.removeAttribute("disabled");
    },
    Display: function (elementID) {
        var input = $("[ID$=" + elementID + "]");
        $(input).show();
    },
    Hide: function (elementID) {
        var input = $("[ID$=" + elementID + "]");
        $(input).hide();
    },
    DateTimeReviver: function (key, value) {
        var a;
        if (typeof value === 'string') {
            a = /\/Date\((\d*)\)\//.exec(value);
            if (a) {
                return new Date(+a[1]);
            }
        }
        return value;
    },
    StringFormat: function () {
        var s = arguments[0];
        for (var i = 0; i < arguments.length - 1; i++) {
            var reg = new RegExp("\\{" + i + "\\}", "gm");
            s = s.replace(reg, arguments[i + 1]);
        }

        return s;
    },
    ValidaRFC: function (rfc) {
        rfc = rfc.toUpperCase();
        if (rfc.match(_rfc_pattern_pm) || rfc.match(_rfc_pattern_pf)) {
            return true;
        } else {
            return false;
        }
    },
    SetToInvalidField: function (elementID, valid) {
        var element = $("[Id$=" + elementID + "]");

        if (!valid || typeof (valid) == 'undefined') {
            $(element).addClass("invalid-field");
        } else {
            $(element).removeClass("invalid-field");
        }
    },
    GetRowProperties: function (gridID, rowIndex) {

        var datos = {}
        $("#" + gridID + " tbody tr").each(function (index) {
            if (index == rowIndex) {
                $(this).children("td").each(function (index2) {
                    var propertyname = $(this)[0].getAttribute("abbr");
                    if (propertyname != null && propertyname != '') {
                        if ($(this).find("input").length > 0) {
                            datos[propertyname] = $(this).find("input").val();
                        } else if ($(this).find("select").length > 0) {
                            datos[propertyname] = $(this).find("select").val();
                        } else {
                            datos[propertyname] = $(this).text();
                        }
                    }
                });

                return datos;
            }
        });

        return datos;
    },
    SetColumnValue: function (gridID, rowIndex, propertyName,  value) {
        $("#" + gridID + " tbody tr").each(function (index) {
            if (index == rowIndex) {
                $(this).children("td").each(function (index2) {
                    var name = $(this)[0].getAttribute("abbr");
                    if (name != null && name != '') {
                        if (name == propertyName) {
                            $(this).text('')
                            $(this).text(value)
                        }
                    }
                });
            }
        });
    },
    GetGridData: function (gridID) {
        var returnValue = [];
        
        $("#" + gridID + " tbody tr").each(function (index) {
            
            if (index == 0) {
                if ($(this)[0].className.indexOf('jsgrid-nodata-row') != -1) {
                    return returnValue;
                }

            }

            

            var datos = {}
            $(this).children("td").each(function (index2) {
                var propertyname = $(this)[0].getAttribute("abbr");
                if (propertyname != null && propertyname != '') {
                    if ($(this).find("input").length > 0) {
                        datos[propertyname] = $(this).find("input").val();
                    } else if ($(this).find("select").length > 0) {
                        datos[propertyname] = $(this).find("select").val();
                    } else {
                        datos[propertyname] = $(this).text();
                    }
                }
            });

            returnValue.push(datos);
        });

        return returnValue;
    }
}

function Press(id, desc) {
    if ($("#" + id).length < 3) $("#" + desc).val('');
}

function ValidaEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function OnBeginRequest(sender, args) {
    try {
        Ex.load(true);
    }
    catch (e) {

    }
}

//    function OnEndRequest(sender, args) {
//        try {
//            Ex.load(false);
//            return;
//            //setTimeout(Ex.load, 1, false);
//        }
//        catch (e) {
//            Ex.load(false);
//        }
//    }

function OnEndRequest(sender, args) {
    if (args.get_error() != undefined) {
        var errorMessage;
        if (args.get_response().get_statusCode() == '200') {
            errorMessage = args.get_error().message;
            errorMessage = errorMessage.replace('Sys.WebForms.PageRequestManagerServerErrorException', 'Error');
        }
        else {
            errorMessage = 'Error no identificado. ';
        }
        args.set_errorHandled(true);
        Ex.mensajes(errorMessage);
        Ex.load(false);
    } else {
        Ex.load(false);
    }
}

Exertus.BuildServer = function () {
    if (Exertus.Server != null)
        return;
    Exertus.Server = {};
    var type = Exertus.Server;

    type.data = {}

    type.Error = function (detail, adetail, bdetail) {
        Ex.load(false);
        Exertus.Server.HandlerError(detail);
    }

    type.HandlerError = function (detail) {
        obj = new Object()
        try {
            obj = JSON.parse(detail.responseText)
        }
        catch (e) {
            obj.Message = detail.responseText;
        }

        //Cuando se termino la sessión el mensaje contiene un -999
        if (obj.Message.indexOf("-999") > -1) {

            obj.Message = obj.Message.replace("-999.-", '');
            Ex.mensajes(obj.Message, 1, Ex.GetResourceValue('title-sin-conexion') == '' ? 'SIN Conexión' : Ex.GetResourceValue('title-sin-conexion'), null, null, function () {
                if (window.parent) window.parent.location = aplicacionURL + 'pages/login.aspx';
            });
        } else {
            //Usamos el prefijo "efdb" error from data base para poder enviar mensajes de error en el idioma de la aplicación.
            if (obj.Message.startsWith('efdb')) {
                if (obj.Message.indexOf('|') > 0) {
                    var keys = obj.Message.split('|');
                    var message = '';
                    if (keys.length > 0) {
                        message = Ex.GetResourceValue(keys[0]);

                        if (message.length == 0) {
                            message = 'No se encontró el recurso ' + ' ' + keys[0] + ':';
                        }
                    }

                    for (var i = 0; i < keys.length; i++) {
                        if (i > 0) {
                            message = message.replaceAll('{' + (i - 1).toString() + '}', keys[i]);
                        }
                    }

                    Ex.mensajes(message);

                }
                else {
                    Ex.mensajes(obj.Message);
                }
            }
            else {
                Ex.mensajes(obj.Message);
            }
        }
    }

    type.Sucess = function () {
        Ex.load(false);
    }

    type.Execute = function (p_metodo, p_data, p_callhandler, p_errorhandler, load) {
        try {
            if (load != undefined) { Ex.load(true); }
            $.ajax({
                type: "POST",
                data: JSON.stringify({ datos: (Ex.isUndefined(p_data) ? this.data : p_data) }),
                url: $(location).attr('pathname') + '/' + p_metodo,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Ex.isUndefined(p_callhandler) ? this.Sucess : p_callhandler),
                error: (Ex.isUndefined(p_errorhandler) ? this.Error : p_errorhandler)
            });
        }
        catch (e) {
            Ex.load(false);
            alert(e);
        }
    }

    type.ExecutePath = function (p_path, p_metodo, p_data, p_callhandler, p_errorhandler) {
        try {
            $.ajax({
                type: "POST",
                data: JSON.stringify({ datos: (Ex.isUndefined(p_data) ? this.data : p_data) }),
                url: p_path + '/' + p_metodo,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: (Ex.isUndefined(p_callhandler) ? this.Sucess : p_callhandler),
                error: (Ex.isUndefined(p_errorhandler) ? this.Error : p_errorhandler)
            });
        }
        catch (e) {
            Ex.load(false);
            alert(e);
        }
    }
}

Exertus.BuildModal = function () {
    if (Exertus.Modal != null)
        return;
    Exertus.Modal = {};
    var type = Exertus.Modal;
    type.Show = function (id, t, b, w, h, m) {
        w = (w == null ? 400 : w);
        h = (h == null ? 300 : h);
        b = (b == null ? {} : b);
        m = (m == null ? true : m);
        $('#' + id).dialog({
            autoOpen: false,
            width: w,
            height: h,
            buttons: b,
            title: t,
            modal: m,
            open: function (type, data) {
                $(".ui-dialog-titlebar-close").hide();
                $('body').css('overflow', 'hidden');
                $(this).parent().appendTo("form");
            },
            close: function (type, data) {
                $('body').css('overflow', 'auto');
                Ex.clear(id);
            },
            closeOnEscape: false
        });

        $('#' + id).dialog("open");
    }
    type.Hide = function (id) {
        Ex.clear(id);
        $('#' + id).dialog("close");
    }

}

Exertus.BuildGridView = function () {
    if (Exertus.GridView != null)
        return;
    Exertus.GridView = {};
    var type = Exertus.GridView;

    type.GetValueCell = function (rowIndex, colId, gridId) {
        var gridView = document.getElementById(gridId);
        var gridRow = gridView.rows[rowIndex];
        var gridCell = gridRow.cells[colId];
        if (null != gridCell) {
            return (gridCell.innerText ? gridCell.innerText : gridCell.innerHTML);
        }
        return null;
    }

    type.SetCell = function (rowIndex, colId, gridId, value) {
        gridView = document.getElementById(gridId);
        var gridRow = gridView.rows[rowIndex];
        var gridCell = gridRow.cells[colId];
        if (null != gridCell) {
            gridCell.innerHTML = value;
        }
        return null;
    }

    type.GetData = function (gridId, colId) {
        // Obtiene todos los registros de la pagina actual.
        var data = [];
        gridView = document.getElementById(gridId);
        for (var index = 1; index < gridView.rows.length; index++) {
            var gridCell = gridView.rows[index].cells[colId];
            if (null != gridCell) {
                data.push((gridCell.innerText ? gridCell.innerText : gridCell.innerHTML));
            }
        }
        return data;
    }

    type.getSelected = function (gridId) {
        var dataArr = new Array();
        var gridView = document.getElementById(gridId);
        if (gridView != null) {
            for (var irow = 1; irow < gridView.rows.length; irow++) {
                var gridRow = gridView.rows[irow];
                var header = gridView.rows[0];
                var celdas = gridRow.cells;
                var bolAdd = false;
                var data = new Object();
                for (var icell = 0; icell < celdas.length; icell++) {
                    var gridCell = gridRow.cells[icell];
                    var headerCell = header.cells[icell];
                    var check = gridRow.cells[0].getElementsByTagName("INPUT")[0];
                    if (check != undefined) {
                        if (check.type == 'checkbox') {
                            if (check.checked && headerCell.abbr) {
                                data[headerCell.abbr] = (gridCell.innerText ? gridCell.innerText : gridCell.innerHTML);
                                bolAdd = true;
                            }
                        }
                    }
                }
                if (bolAdd) {
                    bolAdd = false;
                    dataArr[dataArr.length] = data;
                }
            }
        }
        return dataArr;
    }

    type.setSelected = function (gridId) {
        var dataArr = new Array();
        var gridView = document.getElementById(gridId);
        if (gridView != null) {
            for (var irow = 1; irow < gridView.rows.length; irow++) {
                var gridRow = gridView.rows[irow];
                var header = gridView.rows[0];
                var celdas = gridRow.cells;
                var bolAdd = false;
                var data = new Object();
                for (var icell = 0; icell < celdas.length; icell++) {
                    var gridCell = gridRow.cells[icell];
                    var headerCell = header.cells[icell];
                    if (icell == 0) {
                        var check = gridRow.cells[0].getElementsByTagName("INPUT")[0];
                        if (check != undefined) {
                            if (check.type == 'checkbox') {
                                if (check.checked) {
                                    check.checked = false;
                                } else {
                                    check.checked = true;
                                }
                            }
                        }

                    }
                }
            }
        }
    }

    type.getAll = function (gridId) {
        var data = new Object();
        var dataReg = [];
        var gridView = document.getElementById(gridId);
        if (gridView != null) {
            for (var irow = 0; irow < gridView.rows.length; irow++) {
                var gridRow = gridView.rows[irow];
                var header = gridView.rows[0];
                var celdas = gridRow.cells;
                var bolAdd = false;
                var data = new Object();
                for (var icell = 0; icell < celdas.length; icell++) {
                    var gridCell = gridRow.cells[icell];
                    var headerCell = header.cells[icell];
                    if (null != gridCell) {
                        if (headerCell.abbr) {
                            data[headerCell.abbr] = (gridCell.innerText ? gridCell.innerText : gridCell.innerHTML);
                        }
                    }
                }
                dataReg.push(data);
            }
        }
        return dataReg;
    }

    type.Get = function (gridId, rowIndex) {
        var data = new Object();
        var gridView = document.getElementById(gridId);
        var gridRow = gridView.rows[rowIndex];
        var header = gridView.rows[0];
        var celdas = gridRow.cells;
        for (var index = 0; index < celdas.length; index++) {
            var gridCell = gridRow.cells[index];
            var headerCell = header.cells[index];
            if (null != gridCell) {
                if (headerCell.abbr) {
                    data[headerCell.abbr] = (gridCell.innerText ? gridCell.innerText : gridCell.innerHTML);
                }
            }
        }
        return data;
    }


    type.AddRow = function (gridId) {
        var renglon = 0;
        var grd = document.getElementById(gridId);
        if (grd.rows.length > 15) renglon = 1;
        var row = grd.insertRow(grd.rows.length - renglon);
        if (grd.rows.length % 2 === 0)
            jQuery(row).addClass("alt");
        else
            jQuery(row).addClass("row");
        return row;
    }

    type.AddCell = function (bolId, row, index, texto) {
        cell = row.insertCell(index);
        textNode = document.createTextNode(texto);
        jQuery(cell).addClass("cell");
        cell.appendChild(textNode);
        if (bolId === true) {
            cell.className = 'nonecell';
        }
        return cell;
    }



}


Exertus.CreateDiv = function () {
    return document.createElement('Div');
}

Exertus.GetBounds = function (el) {
    var rect = el.getBoundingClientRect();
    // Patch the result in IE only, so that this function can be inlined if
    // compiled for non-IE.
    if (jQuery.browser.msie) {

        // In IE, most of the time, 2 extra pixels are added to the top and left
        // due to the implicit 2-pixel inset border.  In IE6/7 quirks mode and
        // IE6 standards mode, this border can be overridden by setting the
        // document element's border to zero -- thus, we cannot rely on the
        // offset always being 2 pixels.

        // In quirks mode, the offset can be determined by querying the body's
        // clientLeft/clientTop, but in standards mode, it is found by querying
        // the document element's clientLeft/clientTop.  Since we already called
        // getBoundingClientRect we have already forced a reflow, so it is not
        // too expensive just to query them all.

        // See: http://msdn.microsoft.com/en-us/library/ms536433(VS.85).aspx
        var doc = el.ownerDocument;
        rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft;
        rect.top -= doc.documentElement.clientTop + doc.body.clientTop;
    }
    return /** @type {Object} */(rect);
};

Exertus.BuildAnchoredTooltip = function () {

    if (Exertus.AnchoredTooltip != null)
        return;

    Exertus.AnchoredTooltip = function (anchor, content, config) {
        this.Config = jQuery.extend({}, Exertus.AnchoredTooltip.DefaultConfig, config);
        this.Anchor = typeof anchor === "string"
            ? document.getElementById(anchor)
            : anchor;

        content = typeof content === "string"
            ? document.createTextNode(content)
            : content;

        this.Anchor.TooltipController = this;
        this.Root = Exertus.CreateDiv();
        this.Root.appendChild(content);
        this.Content = content;

        jQuery(this.Root).addClass("tooltipm");

        var div;

        if (this.Config.TitleBehavior !== true) {
            div = Exertus.CreateDiv();
            jQuery(div).addClass("tooltipm-closebtn");
            div.Controller = this;
            div.setAttribute("onclick", "this.Controller.Close();");
            this.Root.appendChild(div);

        }


        var arrowDiv = Exertus.CreateDiv();
        jQuery(arrowDiv).addClass("tooltipm-leftarrow");

        div = Exertus.CreateDiv();
        jQuery(div).addClass("tooltipm-leftarrow-before");
        arrowDiv.appendChild(div);

        div = Exertus.CreateDiv();
        jQuery(div).addClass("tooltipm-leftarrow-after");
        arrowDiv.appendChild(div);

        this.Root.appendChild(arrowDiv);

        if (this.Config.TitleBehavior === true) {
            this.Anchor.setAttribute("onmouseover", " try { this.TooltipController.HandleMouseOver(); } catch(e) { }");
            this.Anchor.setAttribute("onmouseout", " try {  this.TooltipController.HandleMouseOut(); } catch(e) { }");
        }
    }

    Exertus.AnchoredTooltip.DefaultConfig = {
        TopMargin: null,
        LeftMargin: 5,
        TitleBehavior: false,
        ShowDelay: 1000
    };



    var prototype = Exertus.AnchoredTooltip.prototype;

    prototype.Dispose = function () {
        this.Anchor.TooltipController = null;

        this.HandleMouseOut();

        if (this.Config.TitleBehavior === true) {
            this.Anchor.removeAttribute("onmouseover");
            this.Anchor.removeAttribute("onmouseout");
        }
    }

    prototype.HandleMouseOver = function () {

        if (this.TimerID != null)
            return;
        window.CurrentTooltip = this;
        this.TimerID = window.setTimeout("window.CurrentTooltip.Show();", this.Config.ShowDelay);

    }

    prototype.HandleMouseOut = function () {
        if (this.TimerID != null) {
            window.clearTimeout(this.TimerID);
            this.TimerID = null;
        }


        this.Close();
    }


    prototype.SetContent = function (content) {
        this.Root.removeChild(this.Content);
        this.Content = content;

    }
    prototype.Show = function () {
        var bounds = Exertus.GetBounds(this.Anchor);
        this.Root.style.left = (bounds.right + this.Config.LeftMargin) + "px";

        if (this.Config.TopMargin == null)
            this.Root.style.top = (bounds.top + this.Config.TopMargin) + "px";
        else {
            var middle = Math.ceil(bounds.height / 2).toFixed(0);
            this.Root.style.top = (bounds.top + middle) + "px";

        }

        document.body.appendChild(this.Root);

        if (this.Content.parentElement != this.Root)
            this.Root.appendChild(this.Content);
    }

    prototype.Close = function () {
        if (this.Root.parentElement == null)
            return;
        this.Root.parentElement.removeChild(this.Root);
    }


}

Exertus.Date = function (input) {
    this.Root = document.createElement("DIV");
    this.OriginalInput = input;
    this.Init();
}

Exertus.Date.BuildType = function () {
    var type = Exertus.Date;
    type.prototype.Type = type;
    type.prototype.Root = document.createElement("DIV");

    if (type.prototype.Init != null)
        return;

    type.HtmlPattern = '<table><tr><td><img role="trigger-button"></td><td class="input-container" ><input type="text" readonly="readonly" /><td><td class="input-container" ><img role="clean-button" ></td></tr></table>';

    type.prototype.Init = function () {

        this.Root.setAttribute("class", "o-date-picker");
        this.Root.innerHTML = this.Type.HtmlPattern;

        this.Input = this.Root.getElementsByTagName("INPUT")[0];

        if (this.OriginalInput != null) {
            var originalParent = this.OriginalInput.parentElement;
            var parent = this.Input.parentElement;
            parent.removeChild(this.Input);
            parent.appendChild(this.OriginalInput);
            //originalParent.appendChild(this.Root);
            this.Input = this.OriginalInput;
        }

        this.Input.Controller = this;


        var images = jQuery("IMG", jQuery(this.Root)).toArray();
        for (var index = 0; index < images.length; index++) {
            var image = images[index];
            image.Controller = this;
            jQuery(image).click(function () { this.Controller.HandleCommand(this); });

            var role = image.getAttribute("role");
            if (role == "clean-button")
                image.setAttribute("src", "../images/blackDeleteDate.png");
            else
                image.setAttribute("src", "../images/datepicker.png");

        }
        var config = {
            changeMonth: true,
            changeYear: true,
            dateFormat: 'dd/mm/yy'
        }

        var yearRangeAttribute = this.Input.getAttribute("year-range");
        if (yearRangeAttribute != null)
            config.yearRange = yearRangeAttribute;
        else if (Exertus.Date.YearRange != null)
            config.yearRange = Exertus.Date.YearRange;


        jQuery(this.Input).datepicker(config);
        this.Input.style.width = "90px"
    }



    type.prototype.HandleCommand = function (sender) {
        var role = sender.getAttribute("role");
        if (role == "clean-button") {
            this.Input.value = "";
            return;
        }

        jQuery(this.Input).datepicker("show");
    }

}

Exertus.DatePicker = function (input) {
    $('#' + input.id).datepicker({ dateFormat: 'dd/mm/yy' }).val();

    $('#' + input.id).blur(function () {
        var date;
        try {
            date = $.datepicker.parseDate('dd/mm/yy', this.value)

            if (date < minDate) {
                this.value = '';
            }
        }
        catch (e) { }

        if (date) {
        }
        else {
            this.value = '';
        }
    });
}

Exertus.DefaultSelectOption = {
    Text: "--- Seleccione ---",
    Value: "0"
}

$(function () {
    if (Ex.GetGlobalResourceValue("seleccioneOption").length > 0) {
        Exertus.DefaultSelectOption.Text = Ex.GetGlobalResourceValue("seleccioneOption");
    }
});

Exertus.AddOption = function (combo, option) {
    try {
        combo.options.add(option);
    }
    catch (ex) {
        try {
            combo.add(option, null);
        }
        catch (iex) {
            var newOption = new Option(option.innerHTML, option.value, false, false);
            if (option.Entity != null)
                newOption.Entity = option.Entity;
            combo.options[combo.options.length] = newOption;
        }
    }
}

Exertus.ClearCombo = function (comboID, defaultOptionInfo) {
    var combo = (typeof comboID == "string") ? document.getElementById(comboID) : comboID;
    combo.innerHTML = "";

    if (defaultOptionInfo != null) {
        var option = document.createElement("option");
        option.innerHTML = defaultOptionInfo.Text;
        option.value = defaultOptionInfo.Value;
        Exertus.AddOption(combo, option);
    }
}

Exertus.DropDownFill = function (comboObject, entities, defaultOptionInfo, value, initialIndex) {

    var combo = (typeof comboObject == "string") ? document.getElementById(comboObject) : comboObject;

    if (combo == null)
        return;
    var currentValue = value || combo.value || "";
    combo.Entities = entities;
    Exertus.ClearCombo(combo, defaultOptionInfo);

    if (entities == null)
        return;

    var displayProperty = combo.getAttribute("display-property");
    var valueProperty = combo.getAttribute("value-property");

    if (displayProperty == null)
        displayProperty = "Value";
    if (valueProperty == null)
        valueProperty = "Key";

    var distinct = combo.getAttribute("distinct") != null;
    var map = {};

    for (var index = initialIndex == null ? 0 : initialIndex; index < entities.length; index++) {
        var entity = entities[index];
        var value = entity[valueProperty];
        if (distinct === true) {
            if (map[value] != null)
                continue;
        }

        var option = document.createElement("option");

        if (comboObject.GetItemText == null)
            option.innerHTML = entity[displayProperty];
        else
            option.innerHTML = comboObject.GetItemText(entity);
        option.value = value;
        option.Entity = entity;

        if (typeof (entity.CssClass) != 'undefined') {
            option.className = entity.CssClass;
        }


        map[value] = true;
        Exertus.AddOption(combo, option);
    }

    combo.GetSelectedEntity = function () {
        try {
            return this.options[this.selectedIndex].Entity;
        }
        catch (e) {
            return null;
        }
    }

    combo.value = currentValue;
    if (combo.selectedIndex === -1)
        combo.selectedIndex = 0;
}

window.Exertus.ParseFloat = function (strValue) {
    if (strValue == null)
        return 0.00;
    strValue = strValue.toString();
    var value = window.parseFloat(strValue);
    return window.isNaN(value) ? 0.00 : value;

}

if (!Array.prototype.remove) {
    Array.prototype.remove = function (itemIndex) { 
        return itemIndex > -1 ? this.splice(itemIndex, 1) : [];
    };
}

String.prototype.replaceAll = function (find, replace) {
    var str = this;
    return str.replace(new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), replace);
};

String.prototype.toTitleCase = function () {
    var i, j, str, lowers, uppers;
    str = this.replace(/([^\W_]+[^\s-]*) */g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });

    // Certain minor words should be left lowercase unless 
    // they are the first or last words in the string
    lowers = ['A', 'An', 'The', 'And', 'But', 'Or', 'For', 'Nor', 'As', 'At',
    'By', 'For', 'From', 'In', 'Into', 'Near', 'Of', 'On', 'Onto', 'To', 'With'];
    for (i = 0, j = lowers.length; i < j; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
          function (txt) {
              return txt.toLowerCase();
          });

    lowers = ['A', 'Un', 'El', 'Y', 'Por', 'As', 'De', 'En', 'Entre', 'Para'];
    for (i = 0, j = lowers.length; i < j; i++)
        str = str.replace(new RegExp('\\s' + lowers[i] + '\\s', 'g'),
          function (txt) {
              return txt.toLowerCase();
          });

    // Certain words such as initialisms or acronyms should be left uppercase
    uppers = ['Id', 'Tv'];
    for (i = 0, j = uppers.length; i < j; i++)
        str = str.replace(new RegExp('\\b' + uppers[i] + '\\b', 'g'),
          uppers[i].toUpperCase());

    return str;
}

String.prototype.normalize = function () {
    var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç_",
        to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc ",
        mapping = {};

    for (var i = 0, j = from.length; i < j; i++)
        mapping[from.charAt(i)] = to.charAt(i);

    var str = this.replace('', '');

    var ret = [];
    for (var i = 0, j = str.length; i < j; i++) {
        var c = str.charAt(i);
        if (mapping.hasOwnProperty(str.charAt(i)))
            ret.push(mapping[c]);
        else
            ret.push(c);
    }

    return ret.join('');
}

if (!Array.prototype.removeByIndex) {
    Array.prototype.removeByIndex = function (index) {
        this.splice(index, 1);
    }
}
