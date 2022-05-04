
(function () {
    var app = angular.module("customDirectives", []);
    
    app.directive('appFilter', function () {
        var directive = {};
        directive.restrict = "E";
        directive.template = "<div ng-transclude ></div>";
        directive.transclude = true;
        directive.scope = {
            model: '='
        };
        directive.link = function (scope, elem, attrs) {

            if (scope.model == null) {
                scope.model = {};
            }

            scope.model.getFilters = function () {
                var childs = elem.find("[ng-model]");
                var arrFilter = [];
                for (var i = 0; i < childs.length; i++) {
                    var child = $(childs[i]);

                    var modelParts = child.attr("ng-model").split(".");
                    var model = modelParts[modelParts.length - 1];

                    var fieldName = child.attr("fieldname");
                    if (fieldName == null) {
                        fieldName = model;
                    }

                    var filterItem = {};

                    filterItem.Value = scope.model[model];
                    filterItem.FieldName = fieldName;
                    filterItem.Comparison = child.attr("comparison");
                    if (filterItem.Comparison == null) {
                        filterItem.Comparison = "Equals";
                    }
                    arrFilter.push(filterItem);
                }

                console.log(arrFilter);

                return arrFilter;

            }

        };

        return directive;
    });

    app.directive('uiModal', function () {
        var directive = {};

        directive.restrict = "E";
        directive.template = '<div ng-transclude class="modal fade" role="dialog" style="display:none; min-height: 85vh;">';
        directive.transclude = true;
        directive.scope = {
            modal: '=',
            size: '@',
            id:'@'
        };

        directive.link = function(scope, element, attrs) {

            var div = $("[role=dialog]:first", element);

            for (var attr in attrs.$attr) {
                if (attrs.hasOwnProperty(attr)) {
                    div.attr(attrs.$attr[attr], attrs[attr]);
                }
            }

            

            div.addClass(scope.size);

            if (typeof (scope.id) != 'undefined') {
                if (scope.id.length > 0) {
                    div.id = scope.id;
                }
            }

            if (scope.modal == null) {
                scope.modal = { };
            }

            scope.modal.open = function (tabNumber, tabActiveID) {
                if (hasTabs) {

                    if (tabNumber == 'undefined') {
                        tabNumber = '0';
                    }

                    if (tabActiveID == 'undefined' || tabActiveID == '') {
                        tabActiveID = null;
                    }

                    $(".tab-pane").removeClass("active in");

                    var id = "#" + div.find(".nav-tabs").attr("id");
                    var tabContentId = "#" + div.find(".tab-content").attr("id");

                    $(id + " li:eq(" + tabNumber + ") a").tab('show');

                    if (tabActiveID != null) {
                        tabContentId = "#" + tabActiveID;
                        $(tabContentId).addClass("fade active in");
                    }
                    else {
                        $(tabContentId + " > div:first-child").addClass("fade active in");
                    }
                }
                div.modal('show');
            };

            scope.modal.close = function() {
                div.modal('hide');
            };

            if (div.find(".modal-body")[0] != null)
            {
                var hasTabs = div.find(".modal-body")[0].hasAttribute("has-tabs");
            }
      
        };
        return directive;
    });

    app.directive('datetimepicker', function () {
        var directive = {};

        directive.restrict = "E";
        directive.require = 'ngModel';
        directive.template = '<input type="text" class="form-control" ng-model="selectedDate" ng-change="dateChanged" ng-required="isRequired" ng-disabled="isDisabled"/>';
        directive.scope = {
            datetimepickerOptions: '=?',
            modelValue: '=ngModel',
            isDisabled: '@'
        };

        directive.link = function (scope, element, attr, modelController) {
            var $input = $(element).find("input");
            scope.datetimepickerOptions = scope.datetimepickerOptions != undefined ? scope.datetimepickerOptions : {};
            

            var defaults = {
                format: "HH:mm",
                widgetParent: "body",
                icons: {
                    up: "icon-chevron-up icon-custom",
                    down: "icon-chevron-down icon-custom"
                }
            };
             
            scope.datetimepickerOptions = _.defaults(scope.datetimepickerOptions, defaults);

            $input.datetimepicker(scope.datetimepickerOptions);
          
            $input.on('dp.change', function (event) {
                $input.data("DateTimePicker").date(this.value);
                $input.data("DateTimePicker").viewDate(this.value);
                scope.selectedDate = this.value;
                modelController.$setViewValue(this.value);
            });

            scope.isRequired = attr.hasOwnProperty("isRequired");

            scope.$watch('isRequired', function (newVal) {
                if (typeof newVal === 'string') {
                    scope.isRequired = newVal === "true";
                }
            });

            scope.isDisabled = attr.$attr.hasOwnProperty("isDisabled");

            scope.$watch('isDisabled', function (newVal) {
                if (typeof newVal === 'string') {
                    scope.isDisabled = newVal === "true";
                }
            });

            modelController.$formatters.push(function(modelValue) {                
                scope.selectedDate = modelValue;
            });
        };
        return directive;
    });

    app.directive('datepicker', function () {
        var directive = {};

        directive.restrict = "E";
        directive.require = 'ngModel';
        directive.template = '<input type="text" class="form-control" ng-model="selectedDate" ng-change="dateChanged" ng-required="isRequired"/>';
        directive.scope = {
            datepickerOptions: '=?',
            item: '=?',
            modelValue: '=ngModel',
            cambiarPeriodo: '&?'
        };

        directive.link = function (scope, element, attr, modelController) {
            var $input = $(element).find("input");
            scope.datepickerOptions = scope.datepickerOptions != undefined ? scope.datepickerOptions : {};

            var defaults = {
                orientation: "auto",
                format: "dd/mm/yyyy",
                language: 'es',
                additionalTop: 60
            };

            scope.datepickerOptions = _.defaults(scope.datepickerOptions, defaults);

            $input.datepicker(scope.datepickerOptions);

            scope.isRequired = attr.hasOwnProperty("isRequired");

            $input.on("keyup", function (e) {
                var number = parseInt(this.value);
                if (isNaN(number)) {
                    this.value = "";
                }
                this.value = this.value.replace(/[^0-9//]/g, '');
            });

            $input.on("keydown", function (e) {
                if (e.keyCode !== 8 && (this.value.length === 2 || this.value.length === 5)) {
                    this.value += "/";
                }
            });

            $input.on("change", function (e) {
                scope.selectedDate = this.value;
                modelController.$setViewValue(scope.selectedDate);
            });

            modelController.$formatters.push(function (modelValue) {
                scope.selectedDate = modelValue;
                $input.datepicker("setDate", modelValue);
                $input.val(modelValue);
                modelController.$setViewValue(modelValue);
            });

            scope.$watch("datepickerOptions.minDate", function (newValue) {
                $input.datepicker('setStartDate', newValue);
            });

            scope.$watch("datepickerOptions.maxDate", function (newValue) {
                $input.datepicker('setEndDate', newValue);
            });
        };
        return directive;
    });
  
    app.directive('datepickerRange', function () {
        var directive = {};

        directive.restrict = "E";
        directive.require = 'ngModel';
        directive.template = '<div ng-model="dates" class="input-daterange input-group" id="datepicker"> ' +
                                '<input id="startDate" ng-model="StartDate" type="text" class="input-sm form-control" name="start" ng-required="isRequired"/>' +
                                '<span class="input-group-addon">{{labelSeparator}}</span>' +
                                '<input id="endDate" ng-model="EndDate" type="text" class="input-sm form-control" name="end" ng-required="isRequired"/>' +
                            '</div>';
        directive.scope = {
            datepickerOptions: '=?',
            labelSeparator: '@',
            modelValue: '=ngModel',
            search: '&'
        };

        directive.link = function (scope, element, attr, modelController) {
            var $inputStart = $(element).find("[name='start']");
            var $inputEnd = $(element).find("[name='end']");

            scope.dates = {};
            scope.isRequired = attr.$attr.hasOwnProperty("isRequired");
            scope.labelSeparator = scope.labelSeparator != undefined ? scope.labelSeparator : "A";
            scope.datepickerOptions = scope.datepickerOptions != undefined ? scope.datepickerOptions : {};

            var defaults = {
                orientation: "bottom",
                format: "dd/mm/yyyy",
                language: 'es',
                additionalTop: 64,
                startDate: "01/01/1900"
            };

            scope.datepickerOptions = _.defaults(scope.datepickerOptions, defaults);

            $(".input-daterange").datepicker(scope.datepickerOptions);

            var onKeyup = function (event, element) {              
                var number = parseInt(element.value);
                if (isNaN(number)) {
                    element.value.value = "";
                }
                return element.value.replace(/[^0-9//]/g, '');
            }

            $("#startDate, #endDate").on("keyup keydown click", function (event) {
                switch (event.type) {
                    case "keyup":
                        this.value = onKeyup(event, this);
                        break;
                    case "keydown":
                        if (event.keyCode !== 8 && (this.value.length === 2 || this.value.length === 5)) {
                            this.value += "/";
                        }
                        break;
                    case "click":
                        $(this).select();
                        break;
                    default:
                }

            });

            $inputStart.on("change", function () {
                if (this.value === "") {
                    $inputEnd.datepicker("setDate", "");
                }
            });

            $inputStart.datepicker().on("changeDate", function (e) {
                scope.dates.StartDate = this.value;
                modelController.$setViewValue(scope.dates);

                if (this.value.length === 10) {
                    var startDate = $inputStart.datepicker("getDate");
                    var endDate = $inputEnd.datepicker("getDate");                 
                    var isSameDate = startDate.getFullYear() === endDate.getFullYear() &&
                        startDate.getMonth() === endDate.getMonth() && startDate.getDate() === endDate.getDate();

                    if (isSameDate || startDate.getMonth() !== endDate.getMonth()) {
                        var monthEndDay = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
                        $inputEnd.datepicker("setDate", monthEndDay);
                        scope.search();
                    }                    
                }
            });

            $inputEnd.datepicker().on("changeDate", function (e) {
                scope.dates.EndDate = this.value;
                modelController.$setViewValue(scope.dates);
            });        
        };
        return directive;
    });

    app.directive('pageSelect', function () {
        return {
            restrict: 'E',
            template: '<input type="text" class="select-page" ng-model="inputPage" ng-change="selectPage(inputPage)"' +
                'style="padding:0; line-height: normal; height:18px; width:40px; min-width:40px" >',
            link: function (scope, element, attrs) {
                scope.$watch('currentPage', function (page) {
                    scope.inputPage = page;
                });
            }
        };
    });

    

    app.directive('imageDimmer', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                $(element).dimmer({
                    on: 'hover'
                });
            }
        };
    });

    app.directive('uiDropdown', function ($compile, $timeout) {
        return {
            restrict: "A",
            require: 'ngModel',
            scope: {
                search: '&',
                multiselectData: '=?',
                idName: '@?' 
            },
            link: function (scope, element, attr, modelController) {
                $timeout(function() {
                    var $select = $(element);

                    var selectCheck = function(valuesSelected) {
                        var totalItems = scope.multiselectData.length;
                        var values = valuesSelected.split(",");
                        for (var i = 0; i < totalItems; i++) {
                            var id = scope.multiselectData[i][scope.idName];
                            var index = _.indexOf(values, id.toString());
                            scope.multiselectData[i].Selected = index !== -1;
                        }
                    }

                    var selectDefaults = function() {
                        var totalItems = scope.multiselectData.length;
                        var values = [];
                        for (var i = 0; i < totalItems; i++) {
                            if (scope.multiselectData[i].Selected) {
                                values.push(scope.multiselectData[i][scope.idName].toString());
                            }
                        }
                        $select.dropdown('set selected', values);
                    }
                    
                    if ($select[0].previousElementSibling.className == "clearDropDown") {
                        $($select[0].previousElementSibling).on("click", function () { 
                            selectDefaults(); 
                        })
                    }
                     
                   

                    $select.dropdown({
                        on: "click",
                        //forceSelection: false,
                        useLabels: false,
                        message: {
                            addResult: 'Add <b>{term}</b>',
                            count: '{count} Seleccionados',
                            maxSelections: 'Max {maxCount} selections',
                            noResults: 'No se encontraron resultados.'
                        },
                        onChange: function(value, text, $selectedItem) {
                            modelController.$setViewValue(value);

                            if (scope.idName) {
                                selectCheck(value);
                            }

                            scope.search();
                            scope.$apply();
                        },
                        fullTextSearch: 'exact'
                    });

                    $(".ui").on("keyup", 'input.search', function() {
                        scope.search({ text: this.value });
                        scope.$apply();
                    });

                    $timeout(function() {
                        selectDefaults();
                    }, 0);

                    modelController.$formatters.push(function(modelValue) {
                        if (modelValue) {
                            
                            $timeout(function () {
                                $select.dropdown('clear');
                                $select.dropdown('set selected', modelValue);
                            }, 0);
                        }
                    });
                }, 100);
            }
        }
    });

    app.directive('stPaginationScroll', ['$timeout', function (timeout) {
        return{
            require: 'stTable',
            link: function (scope, element, attr, ctrl) {
                var itemByPage = 20;
                var pagination = ctrl.tableState().pagination;
                var lengthThreshold = 50;
                var timeThreshold = 400;
                var handler = function () {
                    //call next page
                    ctrl.slice(pagination.start + itemByPage, itemByPage);
                };
                var promise = null;
                var lastRemaining = 9999;
                var container = angular.element(element.parent());

                container.bind('scroll', function () {
                    var remaining = container[0].scrollHeight - (container[0].clientHeight + container[0].scrollTop);

                    //if we have reached the threshold and we scroll down
                    if (remaining < lengthThreshold && (remaining - lastRemaining) < 0) {

                        //if there is already a timer running which has no expired yet we have to cancel it and restart the timer
                        if (promise !== null) {
                            timeout.cancel(promise);
                        }
                        promise = timeout(function () {
                            handler();

                            //scroll a bit up
                            container[0].scrollTop -= 500;

                            promise = null;
                        }, timeThreshold);
                    }
                    lastRemaining = remaining;
                });
            }

        }
    }]);

    app.directive('keyEnter', function () {
        return function (scope, element, attrs) {
            element.bind("keydown keypress", function (event) {
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.keyEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });
    
    app.directive('jsGrid', function () {
        var directive = {};

        directive.restrict = "E"; 
        directive.template = '<div id="{{gridId}}"></div>';
        directive.scope = {
            rows:   '=',
            gridId: '@'
        };
        directive.link = function (scope, element, attr, modelController) {

            var gridID = scope.gridId;

            $scope.$watch('rows', function (newValue) {
                var settings = Ex.GetDefaultSettingsJsGrid();

                settings.id = 'table_' + gridID,
                settings.controller = {
                    loadData: function () {
                        var d = $.Deferred();
                        var datos = []
                        datos.push({});
                        datos.push({});
                        d.resolve(datos);
                        return d.promise();
                    }
                };
                settings.height = "auto",
                settings.fields = [
                    { name: "TipoTelefono", type: "text", width: 200, title: 'A' },
                    { name: "CodigoPais", type: "number", width: 200, title: 'b' },
                    { name: "Telefono", type: "text", width: 200, title: 'C' }
                ],
                $("#" + gridID + "").jsGrid("destroy");
                $("#" + gridID + "").jsGrid(settings);
            });

            
        };
        return directive;
    });

    app.directive('numbersOnly', function () {
        return {
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                function fromUser(text) {
                    if (text) {
                        var transformedInput = text.replace(/[^0-9]/g, '');

                        if (transformedInput !== text) {
                            ngModelCtrl.$setViewValue(transformedInput);
                            ngModelCtrl.$render();
                        }
                        return transformedInput;
                    }
                    return '';
                }
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    });

    app.directive('restrictInput', [function () {

        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var ele = element[0];
                var regex = RegExp(attrs.restrictInput);
                var value = ele.value;

                ele.addEventListener('keyup', function (e) {
                    if (regex.test(ele.value)) {
                        value = ele.value;
                    } else {
                        ele.value = value;
                    }
                });
            }
        };
    }]);


    // Setup the filter
    app.filter('datetimeFormat', function () {

        // Create the return function
        // set the required parameter name to **number**
        return function (date) {

            var splitDate = ''
            var returnDate = '';

            if (typeof (date) == 'undefined' || date == null)
                return '';

            if (date.length > 0) {
                splitDate = date.split("/");
                returnDate = new Date(splitDate[2], splitDate[1] - 1, splitDate[0]);
                var format = Ex.GetGlobalResourceValue("calendarFormat").replace("mm", "MM");

                returnDate = returnDate.format(format);
            }

            return returnDate;
        }
    });
  
    app.directive("enabledForm", function() {
        return{
            restrict: "A",
            scope: {
                formProperty: "="
            },
            link: function (scope, el) {
                scope.$watch('formProperty.disabled', function (newVal) {
                    //$(el).find("input, select, button").prop("disabled", newVal);

                    $(el).find("input, select, button").each(function () {
                        if ($(this).attr("habilita") == null)
                        {
                            $(this).prop("disabled", newVal);
                        }
                        
                    })

                });                
            }
        }
    });

    app.directive("autoWidth", function () {
        return {
            restrict: "A",
            scope: {
                columnName: "@"
            },
            link: function (scope, el) {
                var anchoCelda = scope.columnName.length * 8;
                $(el).width(anchoCelda);
            }
        }
    });

    app.directive('indeterminateCheckbox', [function () {
        return {
            scope: true,
            require: '?ngModel',
            link: function (scope, element, attrs, modelCtrl) {
                var childList = attrs.childList;
                var property = attrs.property;

                // Bind the onChange event to update children
                element.bind('change', function () {
                    scope.$apply(function () {
                        var isChecked = element.prop('checked');

                        // Set each child's selected property to the checkbox's checked property
                        //angular.forEach(scope.$eval(childList), function (child) {
                        //    child[property] = isChecked;
                        //});

                        checkUncheck(scope.$eval(childList), property, isChecked)
                    });
                });

                function checkUncheck(childList, property, isChecked) {
                    angular.forEach(childList, function (child) {
                        child[property] = isChecked;
                        if (child.nodes.length > 0)
                            checkUncheck(child.nodes, property, isChecked)

                    })

                }

                function setChecks(newValue) {
                    if (newValue == null || newValue.length == 0) return;
                    var hasChecked = false;
                    var hasUnchecked = false;
                    angular.forEach(newValue, function (child) {

                        if (child.nodes.length > 0) {
                            //    setChecks(newValue.nodes);

                            angular.forEach(child.nodes, function (child) {
                                if (child[property]) {
                                    hasChecked = true;
                                } else {
                                    hasUnchecked = true;
                                }
                            });

                            if (hasChecked && hasUnchecked) {
                                element.prop('checked', false);
                                element.prop('indeterminate', true);
                                if (modelCtrl) {
                                    modelCtrl.$setViewValue(false);
                                }
                            } else {
                                element.prop('checked', hasChecked);
                                element.prop('indeterminate', false);
                                if (modelCtrl) {
                                    modelCtrl.$setViewValue(hasChecked);
                                }
                            }
                            setChecks(newValue.nodes);

                        }
                        else {
                            if (child[property]) {
                                hasChecked = true;
                            } else {
                                hasUnchecked = true;
                            }
                        }

                    });

                    if (hasChecked && hasUnchecked) {
                        element.prop('checked', false);
                        element.prop('indeterminate', true);
                        if (modelCtrl) {
                            modelCtrl.$setViewValue(false);
                        }
                    } else {
                        element.prop('checked', hasChecked);
                        element.prop('indeterminate', false);
                        if (modelCtrl) {
                            modelCtrl.$setViewValue(hasChecked);
                        }
                    }



                }

                // Watch the children for changes
                scope.$watch(childList, function (newValue) {
                    var hasChecked = false;
                    var hasUnchecked = false;

                    //// Loop through the children
                    //angular.forEach(newValue, function (child) {
                    //    if (child[property]) {
                    //        hasChecked = true;
                    //    } else {
                    //        hasUnchecked = true;
                    //    }
                    //});

                    //// Determine which state to put the checkbox in
                    //if (hasChecked && hasUnchecked) {
                    //    element.prop('checked', false);
                    //    element.prop('indeterminate', true);
                    //    if (modelCtrl) {
                    //        modelCtrl.$setViewValue(false);
                    //    }
                    //} else {
                    //    element.prop('checked', hasChecked);
                    //    element.prop('indeterminate', false);
                    //    if (modelCtrl) {
                    //        modelCtrl.$setViewValue(hasChecked);
                    //    }
                    //}

                    setChecks(newValue);

                }, true);
            }
        };
    }]);
    
    app.directive('upload', ['$interval', 'dateFilter', function ($interval, dateFilter) {
        return {
            scope: {
                // funcion al terminar de subir el archivo
                done: '&',
                // nombre de la variable de sesion
                sesionName: '@',
                //nombre de la url del handler para subir la pagina
                url: '@',
                // objeto para guardar informacion del archivo del cliente 
                file: '=ngModel',
                alt: '@',
                //validar extension
                acceptFileTypes: '@',
                btnName: '@',
                loadingLabel: '@',
                // funcion al iniciar subir el archivo
                start: '&',
                validFiles: '@'
            },
            require: 'ngModel',
            controller: function () {
                var timeoutId;
                var $me = this;
                $me.name = '';
                $me.updateTime = function () {
                    $me.name = $me.name.length > 2 ? '' : $me.name + '.';
                };
                $me.endTime = function () {
                    $interval.cancel(timeoutId);
                };
                $me.starTime = function () {
                    $me.name = '';
                    timeoutId = $interval(function () {
                        $me.updateTime();
                    }, 500);
                };
            },
            controllerAs: 'ctrl',
            template:
              '<div class="control-group">' +
                    '<div class="controls">' +
                        '<span class="btn btn-success fileinput-button">' +
                            '<i class="icon-folder-open icon-white" ></i>' +
                            '<input type="file" name="file" ng-model="file">' +
                            '<span ng-show="file.isBusy">&nbsp;{{loadingLabel}}&nbsp;</span>' +
                            '<span ng-show="!file.isBusy">&nbsp;{{btnName}}&nbsp;</span>' +
                        '</span>' +
                    '</div>' +
                '</div>',
            replace: true,
            restrict: 'E',
            link: function postLink(scope, element, attrs) {

                scope.file = scope.file || {};
                scope.btnName =  "Seleccionar...";
                scope.loadingLabel = "Cargando...";
                var inputEL = $(element).find('input[type=file]')

                $(inputEL).on("change", function (event) {
                    var $path = $(this).val();
                    scope.$apply(function () {
                        scope.file.path = $path;
                        //scope.path = event.target.files[0].name;
                        //scope.fileread = event.target.files[0];
                        // or all selected files:
                        // scope.fileread = event.target.files;
                    });
                });


                //http://stackoverflow.com/questions/15549094/jquery-file-upload-plugin-how-to-validate-files-on-add
                inputEL.fileupload({
                    runSubmitOnChange: false,
                    dataType: 'json',
                    url: scope.url,
                    //acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,                    
                    formData: { "SesionName": scope.sesionName , "Pagina": scope.alt},
                    start: function (e) {
                        var $me = this;
                        scope.$apply(function () {
                            scope.file.isBusy = true;
                            scope.ctrl.starTime();
                            $($me).attr('disabled', 'disabled');
                            $($me).parent('span').addClass('disabled');
                            scope.start();
                        });
                    },
                    add: function (e, data) {
                        var regex = RegExp(scope.acceptFileTypes || '.');
                        if (regex.test(data.files[0].name)) {
                            scope.file.inValid = false;
                            scope.$apply();
                            data.submit();
                        }
                        else {
                            //alert('Extension no valida');
                            scope.file.inValid = true;
                            scope.file.path = "";
                            scope.file.isBusy = false;
                            scope.$apply();
                            //Ex.mensajes("Tipo de archivo inválido, a continuación se muestra una lista de archivos aceptados: " + scope.validFiles);
                            Ex.mensajes(Ex.GetGlobalResourceValue('lblTipoArchivoInvalido') + scope.validFiles);
                            
                            return false;
                        }
                    },
                    fail: function (e, data) {
                        Ex.load(false);
                        var $me = this;
                        scope.$apply(function () {
                            scope.file.isBusy = false;
                            scope.ctrl.endTime();
                            $($me).removeAttr('disabled', 'disabled');
                            $($me).parent('span').removeClass('disabled');
                        });
                        alert("Error: " + data.errorThrown + " Text-Status: " + data.textStatus);
                    },
                    done: function (e, data) {
                        var $me = this;
                        var $params = {};
                        $params.e = e;
                        $params.data = data;
                        scope.$apply(function () {
                            scope.file.isBusy = false;
                            scope.ctrl.endTime();
                            $($me).removeAttr('disabled', 'disabled');
                            $($me).parent('span').removeClass('disabled');
                            scope.done({ "e": $params.e, "data": $params.data });
                        });
                    }
                });
            }
        };
    }]);

})();

