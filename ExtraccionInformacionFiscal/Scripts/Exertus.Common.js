
/// <reference path="JQuery/jquery.js" />
/// <reference path="jQuery.MaskedInputs.js" />


window.DefaultComboValueProperty = "Value";
window.DefaultComboDisplayProperty = "Text";

window.DefaultSelectOption = {
    Text: "Seleccione...",
    Value: ""
}

window.AllSelectOption = {
    Text: "Todos",
    Value: ""
}

window.ClearCombo = function (comboID, defaultOptionInfo) {
    var combo = (typeof comboID == "string") ? document.getElementById(comboID) : comboID;
    jQuery(combo).empty();

    if (defaultOptionInfo != null) {
        var option = document.createElement("option");
        var textNode = document.createTextNode(defaultOptionInfo.Text);

        option.appendChild(textNode);
        option.value = defaultOptionInfo.Value;
        combo.appendChild(option);
    }
}

window.numericMaskConfig = {
    format: "numeric",
    decimals: 4
};

window.PrintDataAsTable = function (title, headers, data) {
    var table = document.createElement("TABLE");
    var row = table.insertRow(0);
    for (var index = 0; index < headers.length; index++) {

        var headerText = headers[index];
        var cell = row.insertCell(index);

        var textNode = document.createTextNode(headerText);
        cell.appendChild(textNode);
        cell.setAttribute("style", "font-weight: bold; background-color:#6475ED; text-align: center;");
    }

    for (index = 0; index < data.length; index++) {
        row = table.insertRow(index + 1);
        var innerData = data[index];
        var previousData = index == 0 ? [] : data[index - 1];

        for (var innerIndex = 0; innerIndex < innerData.length; innerIndex++) {
            cell = row.insertCell(innerIndex);

            if (innerIndex === 6 || innerIndex === 8) {
                textNode = document.createTextNode("________");
                cell.appendChild(textNode);
                cell.HasText = true;
            }

            else {

                var cellText = innerData[innerIndex] || "";
                var previousText = previousData[innerIndex] || "";
                textNode = document.createTextNode(cellText);

                var leftCell = row.cells[innerIndex - 1] || {};
                if (leftCell.HasText === true || (cellText != previousText)) {
                    cell.appendChild(textNode);
                    cell.HasText = true;
                }


            }



        }
    }

    var div = document.createElement("DIV");
    div.appendChild(table);
    var newWindow = window.open("", "", "status,height=800px,width=1000px");
    newWindow.document.write('<html><head><title>' + title + '</title></head><body>');
    newWindow.document.write(div.innerHTML);
    newWindow.document.write("</body></html>");
    newWindow.document.close();



    newWindow.focus();
    newWindow.setTimeout("window.print(); window.close();", 400);


}

window.ExtendSplitters = function (sectionID) {

    var section = document.getElementById(sectionID);
    var targets = [];
    var inputs = jQuery("INPUT", jQuery(section)).toArray();
    for (var index = 0; index < inputs.length; index++) {
        var input = inputs[index];
        var extensionRequired = input.getAttribute("splitter") != null;
        if (extensionRequired === true)
            targets.push(input);
    }


    var allSppliters = [];
    for (index = 0; index < targets.length; index++) {

        var target = targets[index];

        if (target.Splitter == null) {
            var parent = target.parentElement;
            var container = document.createElement("TABLE");

            jQuery(container).addClass("splitter");

            parent.removeChild(target);
            parent.appendChild(container);

            var row = container.insertRow(0);
            var cell = row.insertCell(0);
            cell.appendChild(target);

            jQuery(target).maskOnLeave(window.numericMaskConfig);
            if (target.value === "")
                target.value = "0";

            var controller = {
                Input: target,
                Add: function (quantity) {
                    var value = window.parseInt(this.Input.value);
                    if (window.isNaN(value))
                        value = 0;
                    value += quantity;

                    if (value < 0)
                        value = 0;

                    this.Input.value = value;
                    jQuery(this.Input).maskOnLeave(window.numericMaskConfig);

                }
            };

            row.Splitter = controller;
            target.Splitter = controller;

            cell = row.insertCell(1);
            var button = document.createElement("button");
            var textNode = document.createTextNode("+");

            button.Controller = controller;
            button.appendChild(textNode);

            jQuery(target).addClass("field");
            jQuery(target).attr("role", "inputCell");
            target.setAttribute("maxlength", "8");

            button.setAttribute("onclick", "this.Controller.Add(1); return false;");
            jQuery(button).addClass("button");
            cell.appendChild(button);

            button = document.createElement("button");
            textNode = document.createTextNode("-");

            button.Controller = controller;
            button.appendChild(textNode);

            button.setAttribute("onclick", "this.Controller.Add(-1); return false;");
            jQuery(button).addClass("button");
            cell.appendChild(button);

            allSppliters.push(controller);
        }
    }


    return allSppliters;

}


window.FillCombo = function (comboElement, entities, defaultOptionInfo, currentValue) {


    var combo = (typeof comboElement == "string") ? document.getElementById(comboElement) : comboElement;

    if (combo == null)
        return;

    combo.Entities = entities;
    window.ClearCombo(combo, defaultOptionInfo);

    if (entities == null)
        return;

    var displayProperty = combo.getAttribute("displayProperty") || window.DefaultComboDisplayProperty;
    var valueProperty = combo.getAttribute("valueProperty") || window.DefaultComboValueProperty;

    for (var index = 0; index < entities.length; index++) {
        var entity = entities[index];
        var option = document.createElement("option");
        var textNode = document.createTextNode(entity[displayProperty] || "");

        option.appendChild(textNode);
        option.value = entity[valueProperty];
        option.Entity = entity;
        combo.appendChild(option);
    }

    combo.GetSelected = function () {
        try {
            return this.options[this.selectedIndex].Entity;
        }
        catch (e) {
            return null;
        }
    }

    combo.value = currentValue || '';
    if (combo.selectedIndex === -1)
        combo.selectedIndex = 0;
}



window.BuildComboButton = function () {

    window.ComboButton = function (id, config) {
        this.ID = id;
        this.Selection = {};
        this.Config = config;
        this.Root = document.createElement("DIV");
        this.AllSelectedByDefault = true;


        jQuery(this.Root).addClass("combo-button");
        this.TextDiv = document.createElement("DIV");
        jQuery(this.TextDiv).addClass("text");

        this.Root.appendChild(this.TextDiv);
        this.TextDiv.Controller = this;
        this.State = this.Type.States.Closed;
        var textNode = this.Config.DefaultOptionCode === "all"
            ? document.createTextNode("Todos")
            : document.createTextNode("Seleccione...");

        this.TextDiv.appendChild(textNode);

        jQuery(this.TextDiv).click(function () { this.Controller.ToggleState(); });
        this.ItemsList = document.createElement("TABLE");

        this.ItemsList.setAttribute("style", "border-spacing: 0px");
        this.CommandsSection = document.createElement("DIV");

        jQuery(this.CommandsSection).addClass("commands-row");

        this.ContentDiv = document.createElement("DIV");
        this.ContentDiv.appendChild(this.CommandsSection);
        jQuery(this.ContentDiv).addClass("combo-content");

        var commandLink = document.createElement("button");
        textNode = document.createTextNode("Todos");
        commandLink.appendChild(textNode);
        this.CommandsSection.appendChild(commandLink);
        commandLink.Controller = this;

        jQuery(commandLink).click(function () {
            for (var index = 0; index < this.Controller.Rows.length; index++) {
                var currentRow = this.Controller.Rows[index];
                currentRow.Selected = false;
                this.Controller.ToggleItemState(currentRow);
            }
            return false;
        });

        commandLink = document.createElement("button");
        textNode = document.createTextNode("Ninguno");
        commandLink.appendChild(textNode);
        this.CommandsSection.appendChild(commandLink);
        commandLink.Controller = this;


        jQuery(commandLink).click(function () {
            this.Controller.Selection = {};
            for (var index = 0; index < this.Controller.Rows.length; index++) {
                var currentRow = this.Controller.Rows[index];
                currentRow.Selected = true;
                this.Controller.ToggleItemState(currentRow);
            }
            return false;
        });

        commandLink = document.createElement("button");
        textNode = document.createTextNode("Cerrar");
        commandLink.appendChild(textNode);

        $(textNode).attr("id", "close_" + id);

        this.CommandsSection.appendChild(commandLink);
        commandLink.Controller = this;


        jQuery(commandLink).click(function () {
            this.Controller.Type.CurrentOpen = null;
            this.Controller.ToggleState();

            if (this.Controller.OnClose != null)
                this.Controller.OnClose(this.Controller, this.Controller.GetSelectionIDs());

            return false;
        });





        this.ItemsContainer = document.createElement("DIV");
        jQuery(this.ItemsContainer).addClass("items-container");

        this.ItemsContainer.appendChild(this.ItemsList);

        this.ContentDiv.appendChild(this.ItemsContainer);
        this.ContentDiv.style.display = "none";
        //this.Root.appendChild(this.ContentDiv);
        document.body.appendChild(this.ContentDiv);

        if (this.Type.All[id] != null)
            this.Type.All[id].Dispose();

        this.Type.All[id] = this;


    }

    var type = window.ComboButton;

    type.States = {
        Open: "open",
        Closed: "closed"
    }
    var prototype = type.prototype;
    prototype.Type = type;

    prototype.Dispose = function () {
        if (this.Root.parentElement != null)
            this.Root.parentElement.removeChild(this.Root);
        delete this.Type.All[this.ID];
    }

    prototype.GetSelectionIDs = function () {
        var ids = [];
        for (var property in this.Selection) {
            ids.push(this.Selection[property].Value);
        }
        return ids;

    };

    prototype.GetSelectionTexts = function () {
        var ids = [];
        for (var property in this.Selection) {
            ids.push(this.Selection[property].Text);
        }
        return ids;
    };

    prototype.ToggleItemState = function (row) {

        if (this.AllowMultiSelect === true) {

            if (row.Selected === true) {
                row.Selected = false;
                row.StateImage.style.display = "none";
                delete this.Selection[row.UID];
            }
            else {
                row.Selected = true;
                row.StateImage.style.display = "";
                this.Selection[row.UID] = row.DataItem;
            }

            var count = 0;
            var builder = [];
            for (var property in this.Selection) {
                var selectedValue = this.Selection[property];
                builder.push(selectedValue[this.Config.DisplayField]);
                count++;
            }
            var textNode;
            if (count > 0) {
                textNode = document.createTextNode(count + " elementos seleccionados.");
                this.TextDiv.title = builder.join('\n');
            }
            else {
                if (this.Config.DefaultOptionCode == "all")
                    textNode = document.createTextNode("Todos");
                else
                    textNode = document.createTextNode("Seleccione...");
                this.TextDiv.title = "";
            }
            jQuery(this.TextDiv).empty();


            this.TextDiv.appendChild(textNode);
            return;
        }

        if (this.SelectedRow === row)
            return;


        if (this.SelectedRow != null)
            this.SelectedRow.StateImage.style.display = "none";

        row.Selected = !row.Selected;
        this.SelectedValue = row.DataItem.ID;

        jQuery(this.TextDiv).empty();

        var text = row.DataItem[this.Config.DisplayField];
        this.TextDiv.title = text;

        if (text.length > 25)
            text = text.substring(0, 25) + "...";

        var textNode = document.createTextNode(text);
        this.TextDiv.appendChild(textNode);
        this.SelectedRow = row;
        row.StateImage.style.display = "";
        this.Type.CurrentOpen = null;
        this.ToggleState();
    }

    prototype.ToggleState = function () {
        if (this.State === this.Type.States.Open) {
            if (this.Type.CurrentOpen === this)
                return;

            this.ContentDiv.style.display = "none";
            this.State = this.Type.States.Closed;
            return;
        }

        if (this.Type.CurrentOpen != null) {
            var previous = this.Type.CurrentOpen;
            this.Type.CurrentOpen = null;
            previous.ToggleState();

        }

        var position = window.GetBounds(this.Root);
        this.ContentDiv.style.top = (jQuery("HTML").scrollTop() + position.bottom) + "px";
        this.ContentDiv.style.left = (jQuery("HTML").scrollLeft() + position.left) + "px";
        this.ContentDiv.style.display = "";

        this.State = this.Type.States.Open;
        this.Type.CurrentOpen = this;
    }

    prototype.Databind = function (items) {

        this.Items = items || this.Items || [];
        items = this.Items;

        this.Rows = [];
        this.Selection = {};
        jQuery(this.ItemsList).empty();

        if (this.AllSelectedByDefault === true && this.AllowMultiSelect === true) {
            this.SelectedValues = [];
            for (var index = 0; index < items.length; index++) {


                if (items[index].Selected == null) {
                    this.SelectedValues.push(items[index].Value);    
                }
                else if (items[index].Selected== true) {
                    this.SelectedValues.push(items[index].Value);    
                }
            }
        }

        var altern = false;
        var builder = [];

        for (var index = 0; index < items.length; index++) {

            var item = items[index];

            try {

                var row = this.ItemsList.insertRow(this.ItemsList.rows.length);
                this.Rows.push(row);
                row.UID = "$" + (index + 1);

                var className = altern === true ? "altern-item" : "item";

                jQuery(row).addClass(className);
                row.DataItem = item;
                row.Controller = this;

                jQuery(row).click(function () {
                    this.Controller.ToggleItemState(this);
                });

                var cell = row.insertCell(0);
                cell.setAttribute("style", "width:50px; text-align:center;");
                var image = document.createElement("IMG");

                if (this.SelectedValue === item.Value) {
                    image.style.display = "";
                    jQuery(this.TextDiv).empty();

                    var text = item[this.Config.DisplayField];
                    this.TextDiv.title = text;

                    if (text.length > 25)
                        text = text.substring(0, 25) + "...";
                    textNode = document.createTextNode(text);
                    this.TextDiv.appendChild(textNode);
                    row.Selected = true;
                    this.SelectedRow = row;
                } else if (this.SelectedValues != null) {

                    if (jQuery.inArray(item.Value, this.SelectedValues) > -1) {
                        this.Selection[row.UID] = row.DataItem;
                        row.Selected = true;
                        image.style.display = "";

                        jQuery(this.TextDiv).empty();
                        textNode = document.createTextNode(this.SelectedValues.length + " elementos seleccionados.");
                        builder.push(row.DataItem[this.Config.DisplayField]);
                        this.TextDiv.appendChild(textNode);
                    } else {
                        image.style.display = "none";
                        row.Selected = false;
                    }
                } else {
                    image.style.display = "none";
                    row.Selected = false;
                }

                image.src = "../images/check.png";
                row.StateImage = image;
                cell.appendChild(image);

                cell = row.insertCell(1);
                textNode = document.createTextNode(item[this.Config.DisplayField] || "");
                cell.appendChild(textNode);
                cell.style.width = "350px";
                altern = !altern;
            }
            catch (e) {

            }
        }

        if (items.length == 0 || this.SelectedValues == null || this.SelectedValues.length == 0) {
            jQuery(this.TextDiv).empty();
            textNode = document.createTextNode("Seleccione...");
            this.TextDiv.appendChild(textNode);
        }


        this.TextDiv.title = builder.length === 0 ? "" : builder.join('\n');

    }

    window.ComboButton.All = {};
}


window.BuildComboButton();



window.BuildDatePickerType = function () {



    if (window.DataPicker != null)
        return;

    window.DatePicker = function (input) {
        this.Root = document.createElement("DIV");
        this.OriginalInput = input;
        this.Init();
    }

    var type = window.DatePicker;
    type.prototype.Type = type;
    type.prototype.Root = document.createElement("DIV");

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

            originalParent.appendChild(this.Root);
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
                image.setAttribute("src", "images/blackDeleteDate.png");
            else
                image.setAttribute("src", "images/datepicker.png");

        }
        jQuery(this.Input).datepicker({
            changeMonth: true,
            changeYear: true
        }
        );
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

window.BuildDatePickerType();


window.BuildDataSourceType = function () {

    if (window.Datasource != null)
        return;

    window.Datasource = function () {
        this.Handlers = {};

    }



    var type = window.Datasource;
    var prototype = type.prototype;

    prototype.AddHandler = function (name, handler, context) {
        handler.Context = context;
        this.Handlers[name] = handler;
    }

    prototype.RemoveHandler = function (name) {
        this.Handlers[name] = null;
    }


    prototype.SetData = function (data) {
        this.Data = data;

        for (var name in this.Handlers) {
            var handler = this.Handlers[name];
            var theContext = handler.Context || window;
            handler.call(theContext, this, data);
        }
    }

}

window.BuildDataSourceType();


window.Datasources = {};

window.MultiSelectComboConfig = {
    DisplayField: "Text"
}

window.ExtendControls = function (context, inputs) {

    context = context || document.body;
    var selects = inputs || jQuery("SELECT, INPUT", jQuery(context)).toArray();
    
    for (var index = 0; index < selects.length; index++) {

        var select = selects[index];

        if (select.tagName === "SELECT") {
            var bindElement = false;
            
            var selectID = select.getAttribute("id");
            var datasourceName = select.getAttribute("datasource");
            var multiple = select.getAttribute("multi-selection") != null;
            var datasource = window.Datasources[datasourceName];
            if (datasource == null) {
                datasource = new window.Datasource();
                window.Datasources[datasourceName] = datasource;
            } 
            if (multiple) {
                var combo = new window.ComboButton(selectID + "_MSC", window.MultiSelectComboConfig);
                combo.AllowMultiSelect = true;
                combo.Input = select;
                combo.AllSelectedByDefault = (select.getAttribute("items-selected") || "").toLowerCase() != "false";

                select.parentElement.appendChild(combo.Root);
                combo.FillFromDatasource = function (sender, items) {
                    this.Databind(items);
                };
                select.Extension = combo;
                datasource.AddHandler(selectID, combo.FillFromDatasource, combo);
                select.style.display = "none";
                combo.FillFromDatasource(this, window.Datasources[datasourceName].Data);
            }
            else {
                select.FillFromDatasource = function (sender, items) {

                    var attribute = (this.getAttribute("use-default") || 'true').toLowerCase();
                    var useDefault = attribute === "true";
                    if (useDefault)
                        window.FillCombo(this, items, window.DefaultSelectOption);
                    else
                        window.FillCombo(this, items);
                }
                datasource.AddHandler(selectID, select.FillFromDatasource, select);
            }


        }
        else {
            var isCalendar = select.getAttribute("calendar") != null;
            var readonly = select.getAttribute("readonly") == "readonly";
            if (isCalendar) {
                var minDate = select.getAttribute("minDate");
                var options = { changeMonth: true,
                    changeYear: true
                };
                if (minDate != null) {
                    options.minDate = minDate;
                }
                jQuery(select).datepicker(options);
                if (readonly) {
                    jQuery(select).datepicker("option", "disabled", true);
                }
            }
        }
    }
}

window.GetBounds = function (el) {
    var rect = el.getBoundingClientRect();
    //    if (jQuery.browser.msie) {
    //        var doc = el.ownerDocument;
    //        rect.left -= doc.documentElement.clientLeft + doc.body.clientLeft;
    //        rect.top -= doc.documentElement.clientTop + doc.body.clientTop;
    //    }
    return (rect);
};