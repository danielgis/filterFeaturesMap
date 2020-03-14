define(['dojo/_base/declare', 'jimu/BaseWidgetSetting', 'dijit/_WidgetsInTemplateMixin', 'esri/tasks/QueryTask', 'esri/tasks/query', 'dojo/_base/lang', 'jimu/LayerInfos/LayerInfos', 'dojo/_base/array', "dojo/dom", "dojo/on", "esri/request", 'dojox/layout/TableContainer', "dojo/html", "dijit/form/Select", "dijit/form/TextBox", "dijit/form/Button", "dojo/dom-construct", "dijit/registry"], function (declare, BaseWidgetSetting, _WidgetsInTemplateMixin, QueryTask, Query, lang, LayerInfos, array, dom, on, esriRequest, TableContainer, html, Select, TextBox, Button, domConstruct, registry) {
    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin, QueryTask, Query], {

        baseClass: 'filter-features-setting',

        startup: function startup() {
            this.inherited(arguments);
            this.setConfig(this.config);

            _contador = 0;
            _features = {};
            _divIdPref = 'divff_';
            _keyIdPref = 'keyff_';
            _layerInfosObjClone;
        },

        postCreate: function postCreate() {

            // self = this;
            this._setListLayers(this.NodeUrlDepa, this.NodeFieldLabelDepa, this.NodeFieldValueDepa);
            this._setListLayers(this.NodeUrlProv, this.NodeFieldLabelProv, this.NodeFieldValueProv);
            this._setListLayers(this.NodeUrlDist, this.NodeFieldLabelDist, this.NodeFieldValueDist);

            // this._gridxLayers();
            this._populateSelect();
        },
        setConfig: function setConfig(config) {
            _features = {};
            this.config = config;
            this.NodeUrlDepa.setValue(config.departamento.id);
            this.NodeFieldLabelDepa.setValue(config.departamento.label);
            this.NodeFieldValueDepa.setValue(config.departamento.value);

            this.NodeUrlProv.setValue(config.provincia.id);
            this.NodeFieldLabelProv.setValue(config.provincia.label);
            this.NodeFieldValueProv.setValue(config.provincia.value);

            this.NodeUrlDist.setValue(config.distrito.id);
            this.NodeFieldLabelDist.setValue(config.distrito.label);
            this.NodeFieldValueDist.setValue(config.distrito.value);
        },
        getConfig: function getConfig() {
            // var idSelect;
            // var idButton;
            // for (i = 0; i < _contador; i++) {
            //   idSelect = "selectFF_${i}";
            // }

            return {
                departamento: {
                    'id': this.NodeUrlDepa.value,
                    'label': this.NodeFieldLabelDepa.value,
                    'value': this.NodeFieldValueDepa.value
                },
                provincia: {
                    'id': this.NodeUrlProv.value,
                    'label': this.NodeFieldLabelProv.value,
                    'value': this.NodeFieldValueProv.value
                },
                distrito: {
                    'id': this.NodeUrlDist.value,
                    'label': this.NodeFieldLabelDist.value,
                    'value': this.NodeFieldValueDist.value
                },
                features: _features
            };
        },
        _setListLayers: function _setListLayers(dojonodeService, dojonodeAlias, dojonodeValue) {
            LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, function (layerInfosObj) {
                var infos = layerInfosObj.getLayerInfoArray();
                _layerInfosObjClone = layerInfosObj;
                var options = [];
                for (var i in infos) {
                    var arrayLayers = infos[i].getSubLayers();
                    if (arrayLayers.length > 0) {
                        var arrayoptions = this._listSubLayerdOfRootLayer(arrayLayers);
                        options.push.apply(options, arrayoptions.optSubLayers);
                        _layerInfosObjClone._layerInfos = _layerInfosObjClone._layerInfos.concat(arrayoptions.infoSubLayers);
                    } else {
                        options.push({
                            label: infos[i].title,
                            value: infos[i].id
                            // value: infos[i].layerObject.url,
                        });
                    }
                };
                dojonodeService.options = options;

                dojonodeService.on('change', function (evt) {
                    var selectedLayer = _layerInfosObjClone.getLayerInfoById(evt);

                    var url = selectedLayer.getUrl();
                    esriRequest({
                        url: url + "?f=json"
                        // url: evt + "?f=json"
                    }).then(function (response) {
                        var fields = response.fields;
                        var optionFields = [];
                        fields.forEach(function (field) {
                            optionFields.push({
                                label: field.alias,
                                value: field.name
                            });
                        });
                        dojonodeAlias.set('options', optionFields);
                        dojonodeValue.set('options', optionFields);
                    });
                });
            }));
        },
        _listSubLayerdOfRootLayer: function _listSubLayerdOfRootLayer(arrayLayers) {
            var optionsSublayers = [];
            var infosSublayers = [];
            recursiveSubLayers(arrayLayers);

            function recursiveSubLayers(arrayLayers) {
                for (var i in arrayLayers) {
                    var sublayers = arrayLayers[i].getSubLayers();
                    if (sublayers.length > 0) {
                        recursiveSubLayers(sublayers);
                    } else {
                        optionsSublayers.push({
                            label: arrayLayers[i].title,
                            value: arrayLayers[i].id
                            // value: arrayLayers[i].layerObject.url
                        });
                        infosSublayers.push(arrayLayers[i]);
                    }
                }
            };
            return {
                optSubLayers: optionsSublayers,
                infoSubLayers: infosSublayers
            };
        },
        _populateSelect: function _populateSelect() {
            this.NodeFeatures.options = this.NodeUrlDepa.options;
            // this.NodeFeatures.on('change', function(evt) {
            //     self._addRowLayerSelected(evt);
            // })
        },
        _addRowLayerSelected: function _addRowLayerSelected(evt) {
            var layer = _layerInfosObjClone.getLayerInfoById(evt);
            var url = layer.getUrl();
            _contador = _contador + 1;
            var iddiv = '' + _divIdPref + _contador;
            var keyf = '' + _keyIdPref + _contador;
            var controler = true;

            while (controler) {
                var reg = registry.byId(iddiv);
                if (reg) {
                    _contador = _contador + 1;
                    iddiv = '' + _divIdPref + _contador;
                    keyf = '' + _keyIdPref + _contador;
                } else {
                    controler = false;
                }
            }
            // var regregistry.byId(iddiv)

            // var r = {}
            // r[_contador] = {url: evt}
            _features[keyf] = { id: evt };

            var container = dojo.create("div", { id: iddiv }, "idfeaturesSelected");
            // }

            _programmatic = new TableContainer({
                cols: 2,
                class: "containerItemsFeatures",
                customClass: "labelsAndValues",
                "labelWidth": "40%"
            }, container);

            esriRequest({
                url: url + "?f=json"
            }).then(function (response) {
                var fields = response.fields;
                var optionFields = [{ label: '------', value: '0' }];
                fields.forEach(function (field) {
                    optionFields.push({
                        label: field.alias,
                        value: field.name
                    });
                });
                var sel = new Select({
                    // id: `selectFF_${_contador}`,
                    // name: "fieldSelect",
                    options: optionFields,
                    style: { width: "300px" },
                    label: response.name
                });

                sel.on("change", function (evt) {
                    _features[keyf]["field"] = evt;
                });

                var but = new Button({
                    // id: `buttonFF_${_contador}`,
                    // name: "removeButton",
                    label: "remover",
                    spanLabel: true,
                    onClick: function onClick() {
                        delete _features[keyf];
                        domConstruct.destroy(iddiv);
                    }
                });

                _programmatic.addChild(sel);
                _programmatic.addChild(but);
                _programmatic.startup();
            });

            // Create four text boxes

            // var sel = new Select({
            //   name: "fieldSelect",
            //   options: [{label:1, value:1}],
            //   label: "checar"
            // })

            // var text1 = new TextBox({
            //     label: "ProgText 1"
            // });
            // var text2 = new TextBox({
            //     label: "ProgText 2"
            // });
            // var text3 = new TextBox({
            //     label: "ProgText 3"
            // });
            // var text4 = new TextBox({
            //     label: "ProgText 4"
            // });

            // Add the four text boxes to the TableContainer
            // programmatic.addChild(sel);
            // programmatic.addChild(text2);
            // programmatic.addChild(text3);
            // programmatic.addChild(text4);

            // Start the table container. This initializes it and places
            // the child widgets in the correct place.
            // programmatic.startup();
        }
    });
});
//# sourceMappingURL=Setting.js.map
