
Exertus.BuildBinding = function () {
    if (Exertus.Binding != null)
        return;
    Exertus.Binding = function (element) {
        this.Root = typeof element === "string"
            ? document.getElementById(element)
            : element;
        if (this.Root == null) { alert('Falta elemento ' + element); }
        this.Root.Binding = this;
        this.Groups = {};
        this.Grids = {};
        this.Init();
    }

    Exertus.Binding.Group = function () {
        this.Elements = [];
    }

    Exertus.Binding.Grid = function () {
        this.Elements = [];
    }

    Exertus.Binding.Group.prototype.ClearConstraints = function () {
        for (var index = 0; index < this.Elements.length; index++) {
            var element = this.Elements[index];
            element.DataConstraint = null;
            jQuery(element).removeClass("invalid-field");


            //Verificamos si el control que estamos validando es un multiselect.... de bootstrap.
            if ($(element).parent() != null) {
                if ($(element).parent().find(".multiselect") != null) {
                    $(element).parent().find(".multiselect").removeClass("invalid-field");
                }
            }


        }
    }

    Exertus.Binding.Group.prototype.SetConstraints = function (constraintName) {
        this.ClearConstraints();
        for (var index = 0; index < this.Elements.length; index++) {
            var element = this.Elements[index];
            element.setAttribute("data-constraint", constraintName);
            Exertus.SetConstraint(element);
        }
    }

    Exertus.Binding.Group.prototype.AvoidCapture = function () {
        for (var index = 0; index < this.Elements.length; index++) {
            var element = this.Elements[index];
            element.AvoidCapture = true;

            if (!$(element).hasClass("noDisabled")) { 
                element.setAttribute("disabled", "disabled");
            }
        }
    }

    Exertus.Binding.Group.prototype.AddTitle = function (msgAyuda) {
        for (var index = 0; index < this.Elements.length; index++) {
            var element = this.Elements[index]; 
            element.setAttribute("title", msgAyuda);
        }
    }

    Exertus.Binding.Group.prototype.Display = function (clase) {
        for (var index = 0; index < this.Elements.length; index++) {
            var element = this.Elements[index];
            element.Display = true;
            element.setAttribute("class", clase);
        }
    }

    Exertus.Binding.Group.prototype.EnableCapture = function () {
        for (var index = 0; index < this.Elements.length; index++) {
            var element = this.Elements[index];

            element.AvoidCapture = null;
            delete element.AvoidCapture;
            element.removeAttribute("disabled");
        }
    }

    Exertus.Binding.Group.prototype.Visible = function (esVisible) {
        for (var index = 0; index < this.Elements.length; index++) {
            var element = this.Elements[index];
           
            if (esVisible) {
                $(element).show();
            }
            else {
                $(element).hide();
            }

        }
    }

    var type = Exertus.Binding;
    type.ValidationStates = {
        VALID: "Valid",
        INVALID: "Invalid"
    };

    var prototype = Exertus.Binding.prototype;
    prototype.Type = type;
    prototype.Inputs = {};
    prototype.Validators = {};

    prototype.Init = function () {
        this.Inputs = {};
        this.Validators = {};
        var labels = jQuery("LABEL", jQuery(this.Root));
        for (var index = 0; index < labels.length; index++) {
            var label = labels[index];
            var isValidator = label.getAttribute("validator") != null;
            if (isValidator) {
                var propertyName = label.getAttribute("propertyName");
                if (propertyName != null) {
                    jQuery(label).addClass("validator");
                    this.Validators[propertyName] = {
                        Label: label
                    }
                }
            }
            var isSummary = label.getAttribute("summary") != null;
            if (isSummary)
                this.Summary = label;
        }

        var inputs = jQuery("SPAN, SELECT, INPUT, TEXTAREA, DIV, BUTTON, TD, TH", jQuery(this.Root)).toArray();

        for (var index = 0; index < inputs.length; index++) {
            var input = inputs[index];

            isGrouped = input.getAttribute("group-name");
            if (isGrouped != null) {
                if (typeof (Exertus.Binding.Group) != 'undefined') {
                    this.Groups[isGrouped] = this.Groups[isGrouped] || new Exertus.Binding.Group();
                }
                else {
                    this.Groups[isGrouped] = this.Groups[isGrouped] || new this.Group();
                }
                this.Groups[isGrouped].Elements.push(input);
            }

            isGrid = input.getAttribute("grid");
            if (isGrid != null) {
                this.Grids[isGrid] = this.Grids[isGrid] || new Exertus.Binding.Grid();
                this.Grids[isGrid].Elements.push(input);
            }

            var propertyName = input.getAttribute("property-name");

           

            if (propertyName != null) {

                var calendar = input.getAttribute("calendar");
                if (calendar != null)
                    new Exertus.DatePicker(input);

                var format = input.getAttribute("Format");

                if (format != null) {
                    if (format.toString().toLocaleLowerCase() == "camelcase") {

                        $(input).on("change", function(e){
                            this.value = this.value.toTitleCase().normalize();
                        });

                    }
                }

                this.Inputs[propertyName] = input;
                input.Binding = this;
                Exertus.SetConstraint(input);
            }


        }
    }


    prototype.ReBinding = function (element) {
        this.Root = typeof element === "string"
            ? document.getElementById(element)
            : element;
        if (this.Root == null) { alert('Falta elemento ' + element); }
        this.Root.Binding = this;
        this.Groups = {};

        this.Group = function () {
            this.Elements = [];
        }

        this.Grid = function () {
            this.Elements = [];
        }

        this.Group.prototype.ClearConstraints = function () {
            for (var index = 0; index < this.Elements.length; index++) {
                var element = this.Elements[index];
                element.DataConstraint = null;
                jQuery(element).removeClass("invalid-field");
            }
        }

        this.Group.prototype.SetConstraints = function (constraintName) {
            this.ClearConstraints();
            for (var index = 0; index < this.Elements.length; index++) {
                var element = this.Elements[index];
                element.setAttribute("data-constraint", constraintName);
                Exertus.SetConstraint(element);
            }
        }

        this.Group.prototype.AvoidCapture = function () {
            for (var index = 0; index < this.Elements.length; index++) {
                var element = this.Elements[index];
                element.AvoidCapture = true;
                
                if ($(element).prop("tagName").toLowerCase() == "th" || $(element).prop("tagName").toLowerCase() == "td") {
                    continue; //NO es necesario por que es un th o td
                } 
                
                element.setAttribute("disabled", "disabled");
            }
        }

        this.Group.prototype.Display = function (clase) {
            for (var index = 0; index < this.Elements.length; index++) {
                var element = this.Elements[index];
                element.Display = true;
                element.setAttribute("class", clase);
            }
        }

        this.Group.prototype.EnableCapture = function () {
            for (var index = 0; index < this.Elements.length; index++) {
                var element = this.Elements[index];

                element.AvoidCapture = null;
                delete element.AvoidCapture;
                element.removeAttribute("disabled");
            }
        }

        this.Group.prototype.Visible = function (esVisible) {
            for (var index = 0; index < this.Elements.length; index++) {
                var element = this.Elements[index];

                if (esVisible) {
                    $(element).show();
                }
                else {
                    $(element).hide();
                }

            }
        }

        this.Grids = {};
        this.Init();
    }

    prototype.BindEntity = function (entity) {
        for (var propertyName in this.Inputs) {
            var input = this.Inputs[propertyName]
            var valueProperty = input.getAttribute("valueproperty");

            var theValue = input.GetValue == null ? jQuery.trim(input.value) : input.GetValue();
            var numericType = input.getAttribute("numeric-type") || "";
            numericType = numericType.toLowerCase();

            theValue = theValue == null ? "" : theValue;

            if (input.type === "radio") {
                theValue = (input.checked ? 1 : 0);
            }

            if (input.type === "checkbox") {
                if (numericType === "integer") {
                    theValue = (input.checked ? 1 : 0);
                } else {
                    theValue = input.checked;
                }
            }

            if (numericType === "integer") {
                theValue = window.parseInt(theValue.toString());
                theValue = window.isNaN(theValue) ? 0 : theValue;
            }

            if (numericType === "decimal") {
                theValue = window.parseFloat(theValue.toString());
                theValue = window.isNaN(theValue) ? 0.00 : theValue;
            }

            entity[propertyName] = theValue;

            var includeText = input.getAttribute("includeTextAs");
            if (includeText != null) {
                var selectedOption = input.options[input.selectedIndex];

                entity[includeText] = selectedOption == null ? "" : selectedOption.innerHTML;
            }

        }
    }

    prototype.Databind = function (entity) {

        entity = entity || this.CurrentEntity || {};
        for (var propertyName in this.Inputs) {
            var input = this.Inputs[propertyName];
            var datasourceName = input.getAttribute("datasource");
            var datasource;

            if (input.tagName.toLowerCase() === "div") {
                var extension = input.getAttribute("extension");
                if (extension.toLowerCase() === "selection-list") {
                    datasource = this.Datasources[datasourceName] || [];
                    input.SelectedValues = entity[propertyName] || [];
                    input.Extension.Databind(datasource);
                }
            }

            if (input.tagName === "SELECT") {

                if (datasourceName != null) {
                    datasource = this.Datasources[datasourceName];
                    var filterName = input.getAttribute("filter");
                    var filter = this.Filters[filterName || "_"];
                    if (datasource != null) {
                        var elements = filter == null ? datasource : filter(entity, datasource);
                        Orchestra.Utils.FillCombo(input, elements, Orchestra.DefaultSelectOption, entity[propertyName]);

                        if (input.getAttribute("multi-selection") != null) {
                            if (input.Extension != null) {
                                input.Extension.Databind(elements);
                            }
                            else {
                                input.style.display = "none";
                                input.setAttribute("multiple", "multiple");

                                var zoom = this.Root.getAttribute("zoom-level");
                                zoom = window.parseFloat(zoom);
                                zoom = window.isNaN(zoom) ? 1.0 : zoom;

                                var config = {
                                    Linked: input,
                                    DisplayField: input.getAttribute("display-property"),
                                    Zoom: zoom
                                };

                                var size = input.getAttribute("size");
                                if (size != null) {
                                    config.Size = size;
                                }

                                var combo = new Orchestra.ComboButton(propertyName, config);
                                combo.AllSelectedByDefault = false;
                                combo.AllowMultiSelect = true;
                                combo.Databind(elements);
                                input.parentElement.appendChild(combo.Root);
                                input.Extension = combo;
                                input.CustomGetValue = function () {
                                    return this.Extension.GetSelectionIDs();
                                }
                                input.setAttribute("extension", "combo-button");
                            }
                        }
                    }
                }

                var databindTrigger = input.getAttribute("databind-trigger");
                if (databindTrigger != null) {
                    input.HandleOnChange = function () {
                        this.Binding.BindEntity();
                        this.Binding.Databind();
                    }

                    jQuery(input).on("change", function () { this.HandleOnChange(); });
                }
            }
        }
    }

    prototype.Databind = function (entity) {

        entity = entity || this.CurrentEntity || {};
        for (var propertyName in this.Inputs) {
            var input = this.Inputs[propertyName];
            var datasourceName = input.getAttribute("datasource");
            var datasource;

            if (input.tagName === "SELECT") {

                if (datasourceName != null) {
                    datasource = this.Datasources[datasourceName];
                    var filterName = input.getAttribute("filter");
                    var filter = this.Filters[filterName || "_"];
                    if (datasource != null) {
                        var elements = filter == null ? datasource : filter(entity, datasource);
                        Exertus.FillCombo(input, elements, Orchestra.DefaultSelectOption, entity[propertyName]);
                    }
                }

                var databindTrigger = input.getAttribute("databind-trigger");
                if (databindTrigger != null) {
                    input.HandleOnChange = function () {
                        this.Binding.BindEntity();
                        this.Binding.Databind();
                    }

                    jQuery(input).on("change", function () { this.HandleOnChange(); });
                }
            }
        }
    }

    prototype.BindUI = function (entity) {
        this.CurrentEntity = entity || {};
        for (var propertyName in this.Inputs) {
            var input = this.Inputs[propertyName]
            if (input.tagName === "SELECT") {
                if (input.Extension == null) {
                    var value = this.CurrentEntity[propertyName];
                    if (value === true)
                        value = "1";
                    if (value === false)
                        value = "0";
                    input.value = value == null ? "" : value;
                }
            }
            if (input.type === "checkbox" || input.type === "radio") {
                input.checked = (this.CurrentEntity[propertyName] === true ? true : this.CurrentEntity[propertyName] == "1" ? true : false);
            } else {
                input.value = this.CurrentEntity[propertyName] == null ? "" : this.CurrentEntity[propertyName];
                if (input.ApplyFormat != null)
                    input.ApplyFormat();
            }

            if (input.localName == 'span') {
                $(input).text(input.value);
            }

        }
    }

    prototype.BindGrid = function () {
        for (var propertyName in this.Grids) {
            alert('Grid');
        }
    }

    prototype.Clear = function () {

        var empty = {};
        this.BindUI(empty);
        this.Databind(empty);
        this.UpdateValidationState(empty);

        for (propertyName in this.Inputs) {
            var field = this.Inputs[propertyName];
            Exertus.ClearConstraintStyle(field);
        }
    }

    prototype.ClearConstraints = function () {

        var empty = {}; 
        this.UpdateValidationState(empty);

        for (propertyName in this.Inputs) {
            var field = this.Inputs[propertyName];
            Exertus.ClearConstraintStyle(field);
        }
    }

    prototype.ClearSummary = function () {
        if (this.Summary == null)
            return;

        jQuery(this.Summary).empty();
    }

    prototype.ValidateConstraints = function (ExceptingFields) {
        var summary = {
            Valid: true,
            States: {},
            InputState: {}
        }

        for (var propertyName in this.Inputs) {

            if (typeof (ExceptingFields) != 'undefined') {
                var esNoValidar = false;
                for (var propertyExceptingField in ExceptingFields) {
                    if (propertyExceptingField == propertyName) {
                        esNoValidar = true;
                        break;
                    }
                }

                if (esNoValidar) {
                    continue;
                }
            }


            var input = this.Inputs[propertyName];
            var validationInfo = Exertus.ValidateConstraint(input);
            summary.Valid = summary.Valid && validationInfo.Valid; 
            
            if (validationInfo.Valid !== true && validationInfo.Message != null)
                summary.States[propertyName] = {
                    Message: validationInfo.Message
                };
        }

        if (!summary.Valid)
            this.UpdateValidationState(summary.States);

        return summary;
    }

    prototype.UpdateValidationState = function (states) {
        var summary = {
            Valid: true,
            States: {}
        }
        for (propertyName in states) {
            var input = this.Inputs[propertyName];
            var validationInfo = Exertus.ValidateConstraint(input);
            summary.Valid = summary.Valid && validationInfo.Valid;

            if (validationInfo.Valid !== true && validationInfo.Message != null)
                summary.States[propertyName] = {
                    Message: validationInfo.Message
                };
             
        }
            return summary;
    } 
}

function cambiaTema(obj) {
    var links = document.getElementsByTagName('link');
    var linksP = window.parent.document.getElementsByTagName('link');
    for (i = 0; i < links.length; i++) {
        link = links[i]; themeConst = 'App_Themes/';
        linkP = linksP[i]; themeConst = 'App_Themes/';
        hrefTheme = link.getAttribute('href');
        oldThemeAux = hrefTheme.substring(hrefTheme.indexOf(themeConst) + themeConst.length);
        oldTheme = oldThemeAux.substring(0, oldThemeAux.indexOf('/'));
        newTheme = hrefTheme.replace('/' + oldTheme + '/', '/' + obj.value + '/');
        link.setAttribute('href', newTheme);
        //linkP.setAttribute('href', newTheme);
    }
}