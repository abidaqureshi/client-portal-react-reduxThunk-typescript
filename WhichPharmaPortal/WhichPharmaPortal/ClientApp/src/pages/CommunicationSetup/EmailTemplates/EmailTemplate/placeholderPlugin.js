

export const placeholderPlugin = (placeholders) => ({
    // @Required @Unique
    // plugin name
    name: 'placeholder_custom_plugin_submenu',

    // @Required
    // data display
    display: 'submenu',

    // @Options
    title: 'Add placeholder which will be automatically filled',
    buttonClass: '', 
    innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>',

    // @Required
    // add function - It is called only once when the plugin is first run.
    // This function generates HTML to append and register the event.
    // arguments - (core : core object, targetElement : clicked button element)
    add: function (core, targetElement) {

        // @Required
        // Registering a namespace for caching as a plugin name in the context object
        const context = core.context;
        context.customSubmenu = {
            targetButton: targetElement,
            currentSpan: null
        };

        // Generate submenu HTML
        // Always bind "core" when calling a plugin function
        let listDiv = this.setSubmenu.call(core);

        // You must bind "core" object when registering an event.
        /** add event listeners */
        placeholders.forEach((_, index) => listDiv.querySelector('#button'+index)?.addEventListener('click', this.onClick.bind(core)));
        
        // @Required
        // You must add the "submenu" element using the "core.initMenuTarget" method.
        /** append target button menu */
        core.initMenuTarget(this.name, targetElement, listDiv);
    },

    setSubmenu: function () {
        const listDiv = this.util.createElement('DIV');
        // @Required
        // A "se-submenu" class is required for the top level element.
        listDiv.className = 'se-submenu se-list-layer';
        listDiv.innerHTML = '' +
            '<div class="se-list-inner">' +
                '<ul class="se-list-basic" style="width: 230px;">' +
                    '<li>' +
                        placeholders.map((placeholder, index) => 
                                '<div class="se-submenu-form-group">' +
                                    `<button id="button${index}" type="button" class="se-btn-primary" style="width:100%">` +
                                        placeholder +
                                    '</button>' +
                                '</div>')
                            .reduce((prev, curr) => prev + curr, '') +
                    '</li>' +
                '</ul>' +
            '</div>';

        return listDiv;
    },

    // @Override core
    // Plugins with active methods load immediately when the editor loads.
    // Called each time the selection is moved.
    active: function (element) {
        // If no tag matches, the "element" argument is called with a null value.
        if (!element) {
            this.util.removeClass(this.context.customSubmenu.targetButton, 'active');
            this.context.customSubmenu.currentSpan = null;
        } else if (this.util.hasClass(element, 'se-custom-tag')) {
            this.util.addClass(this.context.customSubmenu.targetButton, 'active');
            this.context.customSubmenu.currentSpan = element;
            return true;
        }

        return false;
    },

    // @Override submenu
    // Called after the submenu has been rendered
    on: function () {
    },

    onClick: function (e) {
        const value =  e.target.innerText;
        
        const span = this.context.customSubmenu.currentSpan;
        if (span) {
            span.textContent = value;
            this.setRange(span, 1, span, 1);
        } else {
            this.functions.insertHTML(`{${value}}`, true);
        }

        this.submenuOff();
    }
});