var app = angular.module('app',
    [
        'smart-table',
        'customDirectives',
        'ngAnimate',
        'ngSanitize',
        'ui.select',
        'only.money',
        'angularjs-dropdown-multiselect',     
        "ui.tree",
        'ui.tree-filter',
        'angularFileUpload',
        'angularUtils.directives.dirPagination',
        'ui.sortable'
    ]);


app.factory('_', function () {
    return window._; //Underscore must already be loaded on the page
});

app.controller("mensajeController", function ($scope, $http) {
    
    $scope.mandarMensaje = function (formaInvalida) {
        $scope.formaMensajeInvalida = formaInvalida;
        if (!formaInvalida) {
            $Ex.Execute("EnviarMensaje", $scope.contact, function (response, isInvalid) {
                $("#dialog").dialog("close");
                $("#success-alert").fadeTo(2000, 1000).slideUp(1000, function () {
                    $("#success-alert").slideUp(1000);
                });
                $scope.contact = {};
            });
        }
    }
})


//Obtiene el objeto dentro de un array por medio del índice, 
//el paramtro object trae la propiedad mediante la cual se hará la busqueda (ex: {id: 5}).
var getObjectByIndex = function(array, object) {
    var index = _.findIndex(array, object);
    return index != -1 ? array[index] : { };
};

app.config(function (uiTreeFilterSettingsProvider) {
    uiTreeFilterSettingsProvider.addresses = ['title', 'description', 'username'];
});
//Constructor para obtener y guardar datos de una forma
var FormHandler = function ($http, options, onSuccess, onError) {
    this.data = {};
    this.isValid = true;
    this.isValidLog = true;
    this.isValidVessel = true;
    this.isValidVesselServices = true;
    this.isValidLoad = true;
    this.isValidTracking = true;
    this.isValidUnLoading = true;
    this.isValidFees = true;

    this.getDataError = false;
    this.form = {};
    this.formVessel = {};
    this.formVesselService = {};
    this.formVesselLoad = {};
    this.formVesselTracking = {};
    this.formVesselUnloading = {};
    this.formVesselFees = {};

    this.options = options;    

    var defaults = {
        details: [],
        detailsToClean: []
    };

    this.data[this.options.mainId] = 0;
    this.formOptions = _.defaults(this.options, defaults);

    if (!this.formOptions.hasOwnProperty("msgInvalidForm")) {
        this.formOptions.msgInvalidForm = "Please check the required information";
    }

    var thisForm = this;

    this.cleanData = function() {
        this.data = {};
        this.data[this.options.mainId] = 0;
        this.isValid = true;
    };

    this.getData = function (data) {
        try {
            Ex.load(true);
            $http.post(location.pathname + '/' + thisForm.formOptions.getMethod, { datos: data })
             .success(function (response) {
                 thisForm.data = JSON.parse(response.d)[0];
                 thisForm.getDataError = false;
                 Ex.load(false);
             })
             .error(function (result) {
                 Ex.mensajes(result.Message);
                 Ex.load(false);
                 thisForm.getDataError = true;
             }); 
        }
        catch(ex) {
            Ex.mensajes(ex.message);
            Ex.load(false);
            thisForm.getDataError = true;
        }
    };

    this.callServer = function (data, serverMethod, isSave, noValidate, nocleanobject) {

        var lastData = $.extend({}, data);

        if (typeof (nocleanobject) == 'undefined') {
            nocleanobject = false;
        }
         
        switch (serverMethod) {
            case 'UpdateVessel':
                this.form = this.formVessel;
                break;
            case 'UpdateVesselService':
                this.form = this.formVesselServices;
                break;
            case 'UpdateVesselLoad':
                this.form = this.formLoad;
                break;
            case 'UpdateVesselTracking':
                this.form = this.formTracking;
                break;
            case 'UpdateVesselUnloading':
                this.form = this.formUnloading;
                break;
            case 'UpdateVesselFees':
                this.form = this.formFees;
            case 'UpdateVesselPedimentos':
                this.form = this.formAssigmentPedimento;
                break; 
        } 
         
        

         
        if (!noValidate && this.form.$invalid) {
            this.isValid = false;
            this.isValidLog = false;

            switch (serverMethod) {
                case 'UpdateVessel':
                    this.isValidVessel = false;
                    break;
                case 'UpdateVesselService':
                    this.isValidVesselServices = false;
                    break;
                case 'UpdateVesselLoad':
                    this.isValidLoad = false;
                    break;
                case 'UpdateVesselTracking':
                    this.isValidTracking = false;
                    break;
                case 'UpdateVesselUnloading':
                    this.isValidUnLoading = false;
                    break;
                case 'UpdateVesselFees':
                    this.isValidFees = false;
                case 'UpdateVesselPedimentos':
                    this.isValidAssigmentPedimento = false; 
                    break;
            } 


            var isInvalidMaxValue = false;

            for (var type in this.form.$error) {
                if (type == 'max') {
                    isInvalidMaxValue = true;
                }
            }

            if (isInvalidMaxValue) {
                Ex.mensajes(Ex.GetGlobalResourceValue("msgExceedMaxValue"));
            } else {
                Ex.mensajes(this.formOptions.msgInvalidForm);
            }

            if (serverMethod == 'UpdateVesselPedimentos')
                return false;

            return;
        } 

        if (isSave) {
           
                var details = this.formOptions.details;
                for (var i = 0; i < details.length; i++) {
                    if (details[i].atLeastOne && details[i].dataList.length === 0) {
                        this.isValid = false;
                        Ex.mensajes(details[i].errosMsg);
                        return;
                    } else {
                        if (!nocleanobject) {
                            for (var y = 0; y < details[i].dataList.length; y++) {
                                var item = details[i].dataList[y];

                                for (var element2 in item) {
                                    var type = typeof (item[element2]);
                                    if (type == 'object') {
                                        if (Array.isArray(item[element2])) {
                                            delete item[element2];
                                        }
                                    }
                                }


                            }
                        }

                        lastData[details[i].detailName] = JSON.stringify(details[i].dataList);
                    }
                }
                if (!nocleanobject) {
                /*
                var detailToClean = this.formOptions.detailsToClean;
                for (i = 0; i < detailToClean.length; i++) {
                    thisForm.data[detailToClean[i]] = "";
                }*/

                //Verifica si existen propiedades que son de tipo arreglo y las serializa.... 
                for (var element in lastData) {
                    var type = typeof (lastData[element]);
                    if (type == 'object') {
                        if (Array.isArray(lastData[element])) {

                            for (var i = 0; i < lastData[element].length; i++) {
                                var item = lastData[element][i];

                                for (var element2 in item) {
                                    var type = typeof (item[element2]);
                                    if (type == 'object') {
                                        if (Array.isArray(item[element2])) {
                                            item[element2] = '';
                                        }
                                    }
                                }


                            }

                            lastData[element] = JSON.stringify(lastData[element]);
                        }
                    }
                }
            }

        }
        
        try {
            Ex.load(true);
            $http.post(location.pathname + '/' + serverMethod, { datos: lastData })
             .success(function (response) {
                 onSuccess(response, isSave);
                 Ex.load(false);
             })
             .error(function (result) {
                 $Ex.Error(result);

                 if (typeof (onError) == 'function') {

                     onError(result, isSave);
                 }
                 Ex.load(false);
             }); 
        }catch (ex) {
            Ex.mensajes(ex.message);
            Ex.load(false);
        }
        
    };

    this.HandlerError = function (detail) {
        var obj = new Object();
        try {
            obj = JSON.parse(detail.Message)
        }
        catch (e) {
            obj.Message = detail.Message;
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
    };

};

//Constructor que maneja las tablas editables, 
//puede recibir la propiedad "fieldsToGetSum" en las opciones si se requiere obtener el total de alguna columna.
var EditableTable = function (options, scope) {
    this.dataList = [];
    this.dataRemoved = [];
    this.options = options;
    var defaults = {
        maxRows: 0,
        properties: [], //columnas de la tabla
        msgToConfirmDelete: "",
        isAddOneByOne: false,
        msgOneByOne:""
    };

    this.tableOptions = _.defaults(this.options, defaults);

    if (!this.tableOptions.hasOwnProperty("msgMaxRows")) {
        this.tableOptions.msgMaxRows = "Only " + this.tableOptions.maxRows + " are allowed";
    }

    var thistable = this;

    var getTotalFieldSum = function (fieldToGetTotal) {
        try {
            var items = thistable.dataList;
            //Si en las opciones se manda la propiedad "fieldsToGetSum"
            if (thistable.tableOptions.hasOwnProperty("fieldsToGetSum") && !fieldToGetTotal) {
                var properties = thistable.tableOptions.fieldsToGetSum;
                for (var property in properties) {
                    if (properties.hasOwnProperty(property)) {
                        properties[property] = items.reduce(function (a, b) {
                            var value = parseFloat(b[property]);
                            value = isNaN(value) ? 0 : value;
                            return a + value;
                        }, 0);
                    }
                }
            } else if (fieldToGetTotal) {
                thistable.tableOptions.fieldsToGetSum[fieldToGetTotal] = items.reduce(function (a, b) {
                    var previousValue = parseFloat(a);
                    previousValue = isNaN(previousValue) ? 0 : previousValue;
                    var value = parseFloat(b[fieldToGetTotal]);
                    value = isNaN(value) ? 0 : value;                    
                    return (previousValue + value);
                }, 0);
            }
        }catch (ex) {
            Ex.mensajes(ex.message);
        }        
    };

    this.cleanTable = function () {
        this.dataList.length = 0;
        this.dataRemoved.length = 0;      
    };

    this.addRow = function (isFirstRow) {
        var newRegister = {};

        if (this.tableOptions.isAddOneByOne) {
            newRegister.isNewAddedRow = true;
            //valida si existe renglones agregados sin guardar....
            for (var i = 0; i < this.dataList.length; i++) {
                if (typeof (this.dataList[i].isNewAddedRow) != 'undefined') {
                    if (this.dataList[i].isNewAddedRow) {

                        if (this.tableOptions.msgOneByOne.length == 0) {
                            this.tableOptions.msgOneByOne = Ex.GetGlobalResourceValue("msgOneByOne");
                        }

                        Ex.mensajes(this.tableOptions.msgOneByOne);
                        return;
                    }
                }
            }
        }

        if (this.tableOptions.maxRows === 0 || this.dataList.length < this.tableOptions.maxRows) {
            var totalProperties = this.tableOptions.properties.length;
            for (var i = 0; i < totalProperties; i++) {
                newRegister[this.tableOptions.properties[i]] = "";
            }

            newRegister["RowIndex"] = this.dataList.length + 1;
            newRegister["IsDirty"] = true;

            if (typeof (isFirstRow) != 'undefined' && isFirstRow) {
                this.dataList.unshift(newRegister);
            }
            else { 
                this.dataList.push(newRegister);
            }
        } else {
            Ex.mensajes(this.tableOptions.msgMaxRows);
        }
    };

    this.removeRow = function (index, row, mainId) {        
        if (row.hasOwnProperty(mainId)) {
            if (this.tableOptions.msgToConfirmDelete != "") {
                Ex.mensajes(this.tableOptions.msgToConfirmDelete, 2, null, null, null, function () {
                    thistable.dataRemoved.push(row);
                    
                    thistable.dataList.splice(index, 1);
                    getTotalFieldSum("");
                    scope.$apply();
                }, function () {

                }, null);
            } else {
                this.dataRemoved.push(row);
                
                thistable.dataList.splice(index, 1);
                getTotalFieldSum("");
            }
        }else {
            this.dataList.splice(index, 1);
            getTotalFieldSum("");
        }                
    };

    this.removeRowPager = function (rowIndex, row, mainId) {
        if (row.hasOwnProperty(mainId)) {
            if (this.tableOptions.msgToConfirmDelete != "") {
                Ex.mensajes(this.tableOptions.msgToConfirmDelete, 2, null, null, null, function () {
                    thistable.dataRemoved.push(row);

                    var index = 0;
                    for (var i = 0; i < thistable.dataList.length; i++) {
                        if (thistable.dataList[i]["RowIndex"] == rowIndex) {
                            index = i;
                            break;
                        }
                    }

                    thistable.dataList.splice(index, 1);
                    getTotalFieldSum("");
                    scope.$apply();
                }, function () {

                }, null);
            } else {
                this.dataRemoved.push(row);

                var index = 0;
                for (var i = 0; i < this.dataList.length; i++) {
                    if (this.dataList[i]["RowIndex"] == rowIndex) {
                        index = i;
                        break;
                    }
                }

                thistable.dataList.splice(index, 1);
                getTotalFieldSum("");
            }
        } else {
            var index = 0;
            for (var i = 0; i < this.dataList.length; i++) {
                if (this.dataList[i]["RowIndex"] == rowIndex) {
                    index = i;
                    break;
                }
            }

            this.dataList.splice(index, 1);
            getTotalFieldSum("");
        }
    };

    this.getTotalField = function (field) {
        getTotalFieldSum(field);
    };

    this.getTotalSUMField = function (fieldToGetTotal) {
            try {
                var items = thistable.dataList; 
                return items.reduce(function (a, b) {
                    var previousValue = parseFloat(a);
                    previousValue = isNaN(previousValue) ? 0 : previousValue;
                    var value = parseFloat(b[fieldToGetTotal]);
                    value = isNaN(value) ? 0 : value;
                    return (previousValue + value);
                }, 0); 
            } catch (ex) {
                Ex.mensajes(ex.message);
            } 
    }
};

var $Ex;
if (!$Ex) {
    $Ex = {};
}

(function () {
    "use strict";
    $Ex.version = "1.1";
    $Ex.Http = null;
    $Ex.Sucess = function () {
        Ex.load(false);
    };

    $Ex.Error = function (detail) {
        Ex.load(false);
        this.HandlerError(detail);
    };

    $Ex.HandlerError = function (detail) {
        var obj = new Object();
        try {
            obj = JSON.parse(detail.Message)
        }
        catch (e) {
            obj.Message = detail.Message;
        }

        if (typeof (detail) == 'string') {
            obj.Message = detail;
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
    };

    $Ex.Execute = function (serverMethod, data, onSuccess, form, load, additionalRulesfn) {
        try {
            if (typeof (load) == 'undefined') {
                load = true;
            }

            if (load) {
                Ex.load(true);
            }

            var lastData = $.extend({}, data);

            if (typeof (form) != 'undefined') {
                if (form.$invalid) {
                    var msgRequiredField = '';
                    msgRequiredField = Ex.GetGlobalResourceValue('msgRequiredFields');
                    if (typeof (form.msgInvalidForm) != 'undefined') {
                        msgRequiredField = form.msgInvalidForm;
                    }

                    var isInvalidMaxValue = false;

                    for (var type in form.$error) {
                        if (type == 'max') {
                            isInvalidMaxValue = true;
                        }
                    }

                    if (isInvalidMaxValue) {
                        msgRequiredField = Ex.GetGlobalResourceValue("msgExceedMaxValue");
                    }


                    Ex.mensajes(msgRequiredField);
                    Ex.load(false);
                    onSuccess(null, true);
                    return;
                }
            }

            if (typeof (additionalRulesfn) == 'function') {
                if (!additionalRulesfn()) {
                    Ex.load(false);
                    return;
                }
            }

            //Verifica si existen propiedades que son de tipo arreglo y las serializa.... 
            for (var element in lastData) {
                var type = typeof (lastData[element]);
                if (type == 'object') {
                    if (Array.isArray(lastData[element])) {
                        lastData[element] = JSON.stringify(data[element]);
                    }
                }
            }


            $Ex.Http.post(location.pathname + '/' + serverMethod, { datos: lastData })
             .success(function (response) {
                 if (typeof (onSuccess) === 'function') {
                     onSuccess(response);
                     Ex.load(false);
                 }
                 else {
                     $Ex.Sucess();
                 }
             })
             .error(function (result) {
                 $Ex.Error(result);
                 Ex.load(false);
             });
        }
        catch (ex) {
            Ex.mensajes(ex.message);
            Ex.load(false);
        }
    }

    $Ex.IsValidateRequiredFieldForm = function (form) {
        if (typeof (form) != 'undefined') {
            if (form.$invalid) {
                var msgRequiredField = '';
                msgRequiredField = Ex.GetGlobalResourceValue('msgRequiredFields');
                if (typeof (form.msgInvalidForm) != 'undefined') {
                    msgRequiredField = form.msgInvalidForm;
                }

                var isInvalidMaxValue = false;

                for (var type in form.$error) {
                    if (type == 'max') {
                        isInvalidMaxValue = true;
                    }
                }

                if (isInvalidMaxValue) {
                    msgRequiredField = Ex.GetGlobalResourceValue("msgExceedMaxValue");
                }


                Ex.mensajes(msgRequiredField);
                Ex.load(false);
                return false;
            }
        }

        return true;
    }

    $Ex.GetTranslateMultiSelectSettings = function () {
        return {
            buttonDefaultText: Ex.GetGlobalResourceValue("labelDefaulMultiselect"),
            checkAll: Ex.GetGlobalResourceValue("labelCheckAllMultiselect"),
            uncheckAll: Ex.GetGlobalResourceValue("labelUnCheckAllMultiselect"),
            selectionCount: 'checked',
            searchPlaceholder: Ex.GetGlobalResourceValue("labelsearchPlaceholder"),
            dynamicButtonTextSuffix: Ex.GetGlobalResourceValue("labeldynamicButtonTextSuffix"),
            buttonClasses: 'btn btn-multiselect'
        }
    }

    $Ex.FormatDate = function (date) {

        var splitDate = ''
        var returnDate = '';

        if (date == null || typeof (date) == 'undefined')
            return '';

        if (date.length > 0) {
            splitDate = date.split("/");
            returnDate = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
            var format = Ex.GetGlobalResourceValue("calendarFormat").replace("mm", "MM");

            returnDate = returnDate.format(format);
        }

        return returnDate;
    }

    $Ex.FormatMoney = function (number, decimals) {
        if (number == null || typeof (number) == 'undefined')
            return '';

        return number.toFixed(decimals).replace(/./g, function (c, i, a) {
            return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
        });

    }

    $Ex.GetArrayPropertyByValue = function (items, colID, valueID, colName) {

        if (typeof (items) == 'undefined')
            return '';

        for (var i = 0; i < items.length; i++) {
            if (items[i][colID] == valueID) {
                return items[i][colName];
            }
        }
    }
}());
