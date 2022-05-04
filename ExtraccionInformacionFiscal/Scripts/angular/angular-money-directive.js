/**
 * Heavily adapted from the `type="number"` directive in Angular's
 * /src/ng/directive/input.js
 */

angular.module('only.money', [])
    .directive('money', function() {
        'use strict';

        var NUMBER_REGEXP = /^\s*(\-|\+)?((\,|\d)+|((\,|\d)*(\.\d*)))\s*$/;
        var localProperties = window.localProperties != undefined ? JSON.parse(window.localProperties) :
            {numberGroupSeparator: ",", decimalSeparator: "."};

        function link(scope, el, attrs, ngModelCtrl) {
            var min = parseFloat(attrs.min || 0);
            var precision = parseFloat(attrs.precision || 2);
            var withSeparator = attrs.separator != "false";
            var lastValidValue;         
            var numberGroupSeparator = localProperties.numberGroupSeparator;
            var regex = null;
            var removeGroupeSeparatorRegEx = null;
            if (numberGroupSeparator == ",") {
                regex = /^\s*(\-|\+)?((\,|\d)+|((\,|\d)*(\.\d*)))\s*$/;
                removeGroupeSeparatorRegEx = /\,/g;
            } else {
                regex = /^\s*(\-|\+)?((\.|\d)+|((\.|\d)*(\,\d*)))\s*$/;
                removeGroupeSeparatorRegEx = /\./g;
            }

            el.addClass("numeric");

            function round(num) {
                var d = Math.pow(10, precision);
                return Math.round(num * d) / d;
            }

            function toFloat(value) {
                var x = value.split(localProperties.decimalSeparator);
                var integerPart = x[0];
                var decimalPart = x.length > 1 ? x[1] : '0';
                if (decimalPart == "") {
                    decimalPart = "0";
                }
                
                var result;
                if (parseFloat(integerPart) < 0) {
                    result = parseFloat(integerPart) - parseFloat(decimalPart) / (Math.pow(10, decimalPart.length));
                }else {
                    result = parseFloat(integerPart) + parseFloat(decimalPart) / (Math.pow(10, decimalPart.length));
                }
                
                return result;
            }

            function addGroupSeparators(numberStr, decimals) {
                numberStr = parseFloat(numberStr);
                if (isNaN(numberStr)) {
                    return "";
                }

                if (decimals != null) {
                    numberStr = numberStr.toFixed(decimals).replace(".", localProperties.decimalSeparator);
                }
                var x = numberStr.split(localProperties.decimalSeparator);
                var integerPart = x[0];
                var decimalPart = x.length > 1 ? localProperties.decimalSeparator + x[1] : '';
                
                if(withSeparator) {
                    var rgx = /(\d+)(\d{3})/;
                    while (rgx.test(integerPart)) {
                        integerPart = integerPart.replace(rgx, '$1' + numberGroupSeparator + '$2');
                    }
                }
                
                return integerPart + decimalPart;
            }

            function formatPrecision(value) {
                return addGroupSeparators(value, precision);
            }


            function formatViewValue(value) {
                return ngModelCtrl.$isEmpty(value) ? '' : '' + value;
            }


            ngModelCtrl.$parsers.push(function(value) {
                if (angular.isUndefined(value)) {
                    value = '';
                }
                
                // Handle leading decimal point, like ".5"
                if (value.indexOf(localProperties.decimalSeparator) === 0) {
                    value = '0' + value;
                }

                // Allow "-" inputs only when min < 0
                if (value.indexOf('-') === 0) {
                    if (min >= 0) {
                        value = null;
                        ngModelCtrl.$setViewValue('');
                        ngModelCtrl.$render();
                    } else if (value === '-') {
                        value = '';
                    }
                }

                var empty = ngModelCtrl.$isEmpty(value);
                if (empty || regex.test(value)) {

                    lastValidValue = (value === '')
                        ? null
                    : (empty ? value : toFloat(value.replace(removeGroupeSeparatorRegEx, '')));
                        //: (empty ? value : parseFloat(value.replace(removeGroupeSeparatorRegEx, '')));
                } else {
                    // Render the last valid input in the field
                    ngModelCtrl.$setViewValue(formatViewValue(lastValidValue));
                    ngModelCtrl.$render();
                }

                ngModelCtrl.$setValidity('number', true);
                return lastValidValue;
            });
            ngModelCtrl.$formatters.push(formatViewValue);

            var minValidator = function(value) {
                if (!ngModelCtrl.$isEmpty(value) && value < min) {
                    ngModelCtrl.$setValidity('min', false);
                    return undefined;
                } else {
                    ngModelCtrl.$setValidity('min', true);
                    return value;
                }
            };
            ngModelCtrl.$parsers.push(minValidator);
            ngModelCtrl.$formatters.push(minValidator);

            if (attrs.max) {
                var max = parseFloat(attrs.max);
                var maxValidator = function(value) {
                    if (!ngModelCtrl.$isEmpty(value) && value > max) {
                        ngModelCtrl.$setValidity('max', false);
                        return undefined;
                    } else {
                        ngModelCtrl.$setValidity('max', true);
                        return value;
                    }
                };

                ngModelCtrl.$parsers.push(maxValidator);
                ngModelCtrl.$formatters.push(maxValidator);
            }

            // Round off
            if (precision > -1) {
                ngModelCtrl.$parsers.push(function(value) {                   
                    return value ? round(value) : value;
                });
                ngModelCtrl.$formatters.push(function(value) {
                    return value ? formatPrecision(value) : value;
                });
            }

            //el.on('click', function () {
            //    this.select();
            //});

            el.bind('blur', function() {
                var value = ngModelCtrl.$modelValue;
                if (value || value === 0) {
                    ngModelCtrl.$viewValue = formatPrecision(value);
                    ngModelCtrl.$render();
                }
            });
        }

        return {
            restrict: 'A',
            require: 'ngModel',
            link: link
        };
    })
    .directive('labelMoney', function() {
        var directive = {};
        directive.restrict = 'A',
        directive.require = 'ngBind';

        function addGroupSeparators(numberStr, decimals) {

            if (isNaN(numberStr)) {
                return "";
            }

            if (decimals != null) {
                numberStr = numberStr.toFixed(decimals);
            }
            var x = numberStr.split('.');
            var integerPart = x[0];
            var decimalPart = x.length > 1 ? "." + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(integerPart)) {
                integerPart = integerPart.replace(rgx, '$1' + numberGroupSeparator + '$2');
            }
            return integerPart + decimalPart;
        }

        function formatPrecision(value) {
            return addGroupSeparators(value, precision);
        }

        directive.link = function (scope, element, attr, ngBindCtrl) {
            ngBindCtrl.$formatters.push(function (value) {
                return value ? formatPrecision(value) : value;
            });
        }

    return directive;

});