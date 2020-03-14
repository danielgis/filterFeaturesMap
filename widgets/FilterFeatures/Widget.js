define(['dojo/_base/declare', 'jimu/BaseWidget', 'dijit/_WidgetsInTemplateMixin', "esri/tasks/query", "esri/tasks/QueryTask", "dojo/dom", "dojo/on", 'dojo/_base/lang', 'jimu/LayerInfos/LayerInfos', "dijit/Dialog", "./GenFunctions", "dijit/registry"], function (declare, BaseWidget, _WidgetsInTemplateMixin, Query, QueryTask, dom, on, lang, LayerInfos, Dialog, genFunction, registry) {
  return declare([BaseWidget, _WidgetsInTemplateMixin, Query, QueryTask], {

    // Custom widget code goes here

    baseClass: 'filter-features',
    gf: genFunction(),

    postCreate: function postCreate() {
      this.inherited(arguments);
      console.log('FilterFeatures::postCreate');
      self = this;
    },
    startup: function startup() {
      this.inherited(arguments);

      _idDepa = this.config.departamento.id;
      _fieldCodDepa = this.config.departamento.value;
      _fieldNomDepa = this.config.departamento.label;
      clause = "1=1";
      _clauseTransversal = "";

      _idProv = this.config.provincia.id;
      _fieldCodProv = this.config.provincia.value;
      _fieldNomProv = this.config.provincia.label;

      _idDist = this.config.distrito.id;
      _fieldCodDist = this.config.distrito.value;
      _fieldNomDist = this.config.distrito.label;

      _layerInfosObjClone = [];
      _codFilter = null;

      LayerInfos.getInstance(this.map, this.map.itemInfo).then(lang.hitch(this, function (layerInfosObj) {
        _layerInfosObjClone = layerInfosObj;
        var infos = layerInfosObj.getLayerInfoArray();
        this.gf._turnLayers(infos, false);
      }));

      this._filterOptions(_idDepa, null, clause, _fieldCodDepa, _fieldNomDepa, self.depaSelectAttachPoint);
    },
    _filterFeatureDepa: function _filterFeatureDepa(evt) {
      var clause = _fieldCodProv + ' like \'' + evt + '%\'';

      this._zoomExtendSelected(_idDepa, _fieldCodDepa, evt);
      this._filterOptions(_idProv, evt, clause, _fieldCodProv, _fieldNomProv, self.provSelectAttachPoint);
    },
    _filterFeatureProv: function _filterFeatureProv(evt) {
      var clause = _fieldCodDist + ' like \'' + evt + '%\'';

      this._zoomExtendSelected(_idProv, _fieldCodProv, evt);
      this._filterOptions(_idDist, evt, clause, _fieldCodDist, _fieldNomDist, self.distSelectAttachPoint);
    },
    _filterFeatureDist: function _filterFeatureDist(evt) {
      _codFilter = evt;
      this._zoomExtendSelected(_idDist, _fieldCodDist, _codFilter);
    },
    _filterOptions: function _filterOptions(idService, value, clause, valueField, labelField, dojonodeAlias) {
      _codFilter = value;
      var feature = _layerInfosObjClone.getLayerInfoById(idService);
      urlService = feature.getUrl();

      var options = [];
      var queryTask = new QueryTask(urlService);
      var query = new Query();
      query.where = clause;
      query.outFields = [valueField, labelField];
      queryTask.execute(query, function (results) {
        for (var i in results.features) {
          var opt = {
            label: results.features[i].attributes[labelField],
            value: results.features[i].attributes[valueField]
          };
          options.push(opt);
        }
        options = self.gf._sortArray(options, 'label');
        dojonodeAlias.set('options', options);
      });
    },
    _zoomExtendSelected: function _zoomExtendSelected(idService, field, value) {

      var clause = field + '=\'' + value + '\'';

      var feature = _layerInfosObjClone.getLayerInfoById(idService);
      urlService = feature.getUrl();
      feature.setFilter(clause);
      feature.show();
      this._setMapExtent(urlService, clause);
    },
    _setMapExtent: function _setMapExtent(urlService, clause) {
      var queryTask = new QueryTask(urlService);
      var query = new Query();
      query.where = clause;
      queryTask.executeForExtent(query, function (response) {
        var extent = response.extent;
        self.map.setExtent(extent, true);
      });
    },
    _filterFeatures: function _filterFeatures(evt) {
      var spinner = document.getElementsByClassName("loaderff")[0];
      spinner.style.visibility = "visible";
      if (_codFilter == null) {
        errorDialog = new Dialog({
          title: "Error",
          content: "No ha seleccionado el ámbito de búsqueda!"
        });
        errorDialog.show();
        return;
      }
      var url;
      var field;
      var clause;
      var queryTask;
      var query;
      var features = this.config.features;
      for (var i in features) {

        idFeature = features[i].id;

        var feature = _layerInfosObjClone.getLayerInfoById(idFeature);
        field = features[i].field;
        clause = this._setClauseTraversal(field + ' like \'' + _codFilter + '%\'');
        feature.setFilter(clause);
        feature.show();
      }
      this._toggleEnabledForm(true);
      spinner.style.visibility = "hidden";
    },
    _toggleEnabledForm: function _toggleEnabledForm(toggle) {
      this.buttonFiltrarff.set('disabled', toggle);
      this.depaSelectAttachPoint.set("disabled", toggle);
      this.provSelectAttachPoint.set("disabled", toggle);
      this.distSelectAttachPoint.set("disabled", toggle);
    },
    _newFilter: function _newFilter() {
      this._toggleEnabledForm(false);
      _clauseTransversal = '';
    },
    _addFilter: function _addFilter() {
      this._toggleEnabledForm(false);
    },
    _setClauseTraversal: function _setClauseTraversal(clause) {
      _clauseTransversal = _clauseTransversal ? _clauseTransversal + ' or ' + clause : clause;
      return _clauseTransversal;
    }
  }

  // onOpen() {
  //   console.log('FilterFeatures::onOpen');
  // },
  // onClose(){
  //   console.log('FilterFeatures::onClose');
  // },
  // onMinimize(){
  //   console.log('FilterFeatures::onMinimize');
  // },
  // onMaximize(){
  //   console.log('FilterFeatures::onMaximize');
  // },
  // onSignIn(credential){
  //   console.log('FilterFeatures::onSignIn', credential);
  // },
  // onSignOut(){
  //   console.log('FilterFeatures::onSignOut');
  // }
  // onPositionChange(){
  //   console.log('FilterFeatures::onPositionChange');
  // },
  // resize(){
  //   console.log('FilterFeatures::resize');
  // }
  );
});
//# sourceMappingURL=Widget.js.map
