define(['dojo/_base/declare', 'jimu/BaseWidget', 'dojo/_base/lang', 'jimu/LayerInfos/LayerInfos'], function (declare, BaseWidget, lang, LayerInfos) {
    return declare([BaseWidget], {
        _turnLayers: function _turnLayers(infos, turn) {
            var layersId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

            recursiveSubLayers(infos, turn, layersId);

            function recursiveSubLayers(infos, turn, layersId) {
                for (var i in infos) {
                    var sublayers = infos[i].getSubLayers();
                    if (sublayers.length > 0) {
                        recursiveSubLayers(sublayers, turn, layersId);
                    } else {
                        if (layersId.length > 0) {
                            if (layersId.includes(infos[i].id)) {
                                turn ? infos[i].show() : infos[i].hide();
                            }
                        } else {
                            turn ? infos[i].show() : infos[i].hide();
                        }
                    }
                }
            };
        },
        _sortArray: function _sortArray(array, idx) {
            array.sort(function (x, y) {
                return x[idx] > y[idx] ? 1 : -1;
            });
            return array;
        }
    });
});
//# sourceMappingURL=GenFunctions.js.map
