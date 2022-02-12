(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.U = factory());
}(this, (function () {
    'use strict';

    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
        try {
            var info = gen[key](arg);
            var value = info.value;
        } catch (error) {
            reject(error);
            return;
        }

        if (info.done) {
            resolve(value);
        } else {
            Promise.resolve(value).then(_next, _throw);
        }
    }

    function _asyncToGenerator(fn) {
        return function () {
            var self = this,
                args = arguments;
            return new Promise(function (resolve, reject) {
                var gen = fn.apply(self, args);

                function _next(value) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
                }

                function _throw(err) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
                }

                _next(undefined);
            });
        };
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);

        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            if (enumerableOnly) symbols = symbols.filter(function (sym) {
                return Object.getOwnPropertyDescriptor(object, sym).enumerable;
            });
            keys.push.apply(keys, symbols);
        }

        return keys;
    }

    function _objectSpread2(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};

            if (i % 2) {
                ownKeys(Object(source), true).forEach(function (key) {
                    _defineProperty(target, key, source[key]);
                });
            } else if (Object.getOwnPropertyDescriptors) {
                Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
            } else {
                ownKeys(Object(source)).forEach(function (key) {
                    Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
                });
            }
        }

        return target;
    }

    var allProps = {
        paints: 'fill-antialias,fill-opacity,fill-color,fill-outline-color,fill-translate,fill-translate-anchor,fill-pattern,fill-extrusion-opacity,fill-extrusion-color,fill-extrusion-translate,fill-extrusion-translate-anchor,fill-extrusion-pattern,fill-extrusion-height,fill-extrusion-base,fill-extrusion-vertical-gradient,line-opacity,line-color,line-translate,line-translate-anchor,line-width,line-gap-width,line-offset,line-blur,line-dasharray,line-pattern,line-gradient,circle-radius,circle-color,circle-blur,circle-opacity,circle-translate,circle-translate-anchor,circle-pitch-scale,circle-pitch-alignment,circle-stroke-width,circle-stroke-color,circle-stroke-opacity,heatmap-radius,heatmap-weight,heatmap-intensity,heatmap-color,heatmap-opacity,icon-opacity,icon-color,icon-halo-color,icon-halo-width,icon-halo-blur,icon-translate,icon-translate-anchor,text-opacity,text-color,text-halo-color,text-halo-width,text-halo-blur,text-translate,text-translate-anchor,raster-opacity,raster-hue-rotate,raster-brightness-min,raster-brightness-max,raster-saturation,raster-contrast,raster-resampling,raster-fade-duration,hillshade-illumination-direction,hillshade-illumination-anchor,hillshade-exaggeration,hillshade-shadow-color,hillshade-highlight-color,hillshade-accent-color,background-color,background-pattern,background-opacity'.split(','),
        layouts: 'visibility,fill-sort-key,circle-sort-key,line-cap,line-join,line-miter-limit,line-round-limit,line-sort-key,symbol-placement,symbol-spacing,symbol-avoid-edges,symbol-sort-key,symbol-z-order,icon-allow-overlap,icon-ignore-placement,icon-optional,icon-rotation-alignment,icon-size,icon-text-fit,icon-text-fit-padding,icon-image,icon-rotate,icon-padding,icon-keep-upright,icon-offset,icon-anchor,icon-pitch-alignment,text-pitch-alignment,text-rotation-alignment,text-field,text-font,text-size,text-max-width,text-line-height,text-letter-spacing,text-justify,text-radial-offset,text-variable-anchor,text-anchor,text-max-angle,text-writing-mode,text-rotate,text-padding,text-keep-upright,text-transform,text-offset,text-allow-overlap,text-ignore-placement,text-optional'.split(',')
    };

    // not currently used - weird, makeSource is really returning something slightly different from normal MapGlUtils
    // export type UtilsSource = {
    //     map: UtilsMap,
    //     mapboxgl: Class<MapboxGl>,
    //     // todo add the layer type functions
    // };

    var kebabCase = s => s.replace(/[A-Z]/g, m => "-".concat(m.toLowerCase()));

    var upperCamelCase = s => s.replace(/(^|-)([a-z])/g, (x, y, l) => "".concat(l.toUpperCase()));

    function isPaintProp(prop) {
        return allProps.paints.indexOf(prop) >= 0;
    }

    function isLayoutProp(prop) {
        return allProps.layouts.indexOf(prop) >= 0;
    }

    function whichProp(prop) {
        if (allProps.paints.indexOf(prop) >= 0) {
            return 'paint';
        }

        if (allProps.layouts.indexOf(prop) >= 0) {
            return 'layout';
        }

        return 'other';
    }

    function parseSource(source) {
        if (String(source).match(/\.(geo)?json/) || source.type === 'Feature' || source.type === 'FeatureCollection') {
            return {
                type: 'geojson',
                data: source
            };
        } else if (String(source).match(/^mapbox:\/\//)) {
            return {
                type: 'vector',
                url: source
            };
        } else {
            return source;
        }
    } // so basically any
    // turn a thing, an array of things, a regex or a filter function, into an array


    var resolveArray = (things, map) => {
        if (Array.isArray(things)) {
            return things;
        } else if (things instanceof RegExp) {
            return map.getStyle().layers.map(l => l.id).filter(id => id.match(things));
        } else if (things instanceof Function) {
            return map.getStyle().layers.filter(layer => things(layer)).map(l => l.id);
        } else {
            return [things];
        }
    };
    //     (LayerRef, ...args: Args) => void
    // )
    // Magically turn a function that works on one layer into one that works on multiple layers
    // specified as: an array, a regex (on layer id), or filter function (on layer definition)

    /*
    Cannot return function because in the first argument: [incompatible-return] Either function type [1] is incompatible with `RegExp` [2].
    Or `FillLayerSpecification` [3] is incompatible with `RegExp` [2] in the first argument.
    Or a call signature declaring the expected parameter / return type is missing in `FillLayerSpecification` [3] but exists in function type [4] in the first argument. (index.js:131:12)flow
    */


    var arrayify = f => {
        return function (thingOrThings) {
            for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
            }

            var things = resolveArray(thingOrThings, this.map);
            return things.forEach(t => f.call(this, t, ...args));
        };
    }; // todo
    // assuming each function returns an 'off' handler, returns a function that calls them all


    var arrayifyAndOff = f => {
        return function (thingOrThings) {
            for (var _len3 = arguments.length, args = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
                args[_key3 - 1] = arguments[_key3];
            }

            var things = resolveArray(thingOrThings, this.map);
            var offs = things.map(t => f.call(this, t, ...args));
            return () => offs.forEach(off => off());
        };
    };

    var layerTypes = ['line', 'fill', 'circle', 'symbol', 'video', 'raster', 'fill-extrusion', 'heatmap', 'hillshade']; // $FlowFixMe[prop-missing]

    class MapGlUtils {
        constructor() {
            _defineProperty(this, "_loaded", false);

            _defineProperty(this, "_mapgl", null);

            _defineProperty(this, "map", null);

            _defineProperty(this, "hoverFeatureState", arrayifyAndOff(function (layer, source, sourceLayer, enterCb, leaveCb) {
                if (Array.isArray(source)) {
                    // assume we have array of [source, sourceLayer]
                    var removeFuncs = source.map((_ref) => {
                        var [source, sourceLayer] = _ref;
                        return this.hoverFeatureState(layer, source, sourceLayer);
                    });
                    return () => removeFuncs.forEach(f => f());
                }

                if (source === undefined) {
                    var l = this.getLayerStyle(layer);
                    source = l.source;
                    sourceLayer = l['source-layer'];
                }

                var featureId;

                var setHoverState = state => {
                    if (featureId) {
                        this.map.setFeatureState({
                            source,
                            sourceLayer,
                            id: featureId
                        }, {
                            hover: state
                        });
                    }
                };

                var mousemove = e => {
                    var f = e.features[0];

                    if (f && f.id === featureId) {
                        return;
                    }

                    setHoverState(false);
                    if (!f) return;

                    if (featureId && leaveCb) {
                        leaveCb(_objectSpread2(_objectSpread2({}, e), {}, {
                            oldFeatureId: featureId
                        }));
                    }

                    featureId = f.id;
                    setHoverState(true);

                    if (enterCb) {
                        enterCb(e);
                    }
                };

                var mouseleave = e => {
                    setHoverState(false);

                    if (e && e.oldFeatureId) {
                        e.oldFeatureId = featureId;
                    }

                    featureId = undefined;

                    if (leaveCb) {
                        leaveCb(e);
                    }
                };

                this.map.on('mousemove', layer, mousemove);
                this.map.on('mouseleave', layer, mouseleave);
                return () => {
                    this.map.off('mousemove', layer, mousemove);
                    this.map.off('mouseleave', layer, mouseleave);
                    mouseleave();
                };
            }));

            _defineProperty(this, "clickLayer", arrayifyAndOff(function (layer, cb) {
                var click = e => {
                    e.features = this.map.queryRenderedFeatures(e.point, {
                        layers: [layer]
                    });
                    cb(e);
                };

                this.map.on('click', layer, click);
                return () => this.map.off('click', layer, click);
            }));

            _defineProperty(this, "hoverLayer", arrayifyAndOff(function (layer, cb) {
                var click = e => {
                    e.features = this.map.queryRenderedFeatures(e.point, {
                        layers: [layer]
                    });
                    cb(e);
                };

                this.map.on('click', layer, click);
                return () => this.map.off('click', layer, click);
            }));

            _defineProperty(this, "removeLayer", arrayify(function (layer) {
                var swallowError = data => {
                    if (!data.error.message.match(/does not exist/)) {
                        console.error(data.error);
                    }
                };

                this.map.once('error', swallowError);
                this.map.removeLayer(layer);
                this.map.off('error', swallowError);
            }));

            _defineProperty(this, "setProperty", arrayify(function (layer, prop, value) {
                if (typeof prop === 'object') {
                    Object.keys(prop).forEach(k => this.setProperty(layer, k, prop[k]));
                } else {
                    var kprop = kebabCase(prop);

                    if (isPaintProp(kprop)) {
                        this.map.setPaintProperty(layer, kprop, value);
                    } else if (isLayoutProp(kprop)) {
                        this.map.setLayoutProperty(layer, kprop, value);
                    } else;
                }
            }));

            _defineProperty(this, "setLayerStyle", arrayify(function (layer, style) {
                var _this = this;

                var clearProps = function clearProps() {
                    var oldObj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                    var newObj = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                    return Object.keys(oldObj).forEach(key => {
                        if (!(key in newObj)) {
                            _this.setProperty(layer, key, undefined);
                        }
                    });
                };

                if (typeof layer === 'object' && !Array.isArray(layer) && layer.id && !style) {
                    style = layer; // $FlowFixMe[incompatible-type]
                    // $FlowFixMe[prop-missing]

                    layer = style.id;
                }

                var oldStyle = this.getLayerStyle(layer);
                var newStyle = this.properties(style);
                clearProps(oldStyle.paint, newStyle.paint);
                clearProps(oldStyle.layout, newStyle.layout); // Hmm, this gets murky, what exactly is meant to happen with non-paint, non-layout props?

                this.setProperty(layer, _objectSpread2(_objectSpread2({}, newStyle.paint), newStyle.layout));
            }));

            _defineProperty(this, "show", arrayify(function (layer) {
                this.setVisibility(layer, 'visible');
            }));

            _defineProperty(this, "hide", arrayify(function (layer) {
                this.setVisibility(layer, 'none');
            }));

            _defineProperty(this, "toggle", arrayify(function (layer, state) {
                this.setVisibility(layer, state ? 'visible' : 'none');
            }));

            _defineProperty(this, "showSource", arrayify(function (source) {
                this.setVisibility(this.layersBySource(source), 'visible');
            }));

            _defineProperty(this, "hideSource", arrayify(function (source) {
                this.setVisibility(this.layersBySource(source), 'none');
            }));

            _defineProperty(this, "toggleSource", arrayify(function (sourceId, state) {
                this.setVisibility(this.layersBySource(sourceId), state ? 'visible' : 'none');
            }));

            _defineProperty(this, "setFilter", arrayify(function (layer, filter) {
                this.map.setFilter(layer, filter);
            }));

            _defineProperty(this, "removeSource", arrayify(function (source) {
                // remove layers that use this source first
                var layers = this.layersBySource(source);
                this.removeLayer(layers);

                if (this.map.getSource(source)) {
                    this.map.removeSource(source);
                }
            }));

            _defineProperty(this, "setLayerSource", arrayify(function (layerId, source, sourceLayer) {
                var oldLayers = this.map.getStyle().layers;
                var layerIndex = oldLayers.findIndex(l => l.id === layerId);
                var layerDef = oldLayers[layerIndex];
                var before = oldLayers[layerIndex + 1] && oldLayers[layerIndex + 1].id;
                layerDef.source = source;

                if (sourceLayer) {
                    layerDef['source-layer'] = sourceLayer;
                } else if (sourceLayer !== undefined) {
                    delete layerDef['source-layer'];
                }

                this.map.removeLayer(layerId);

                this._mapAddLayerBefore(layerDef, before);
            }));
        }

        /** Initialises Map-GL-Utils on existing map object.
            @param mapgl Mapbox-GL-JS or Maplibre-GL-JS library. Only needed for later use by `hoverPopup()` etc.
            @returns Initialised MapGlUtils object.
        */
        static init(map, mapgl) {
            map.U = new MapGlUtils();
            map.U._mapgl = mapgl;
            map.U.map = map;
            return map.U;
        }

        static newMap(mapboxgl) {
            var _arguments = arguments;
            return _asyncToGenerator(function* () {
                var params = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : {};
                var options = _arguments.length > 2 && _arguments[2] !== undefined ? _arguments[2] : {};

                function addLayers(style) {
                    var layers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
                    style.layers = [...style.layers, // $FlowFixMe[incompatible-type]
                    ...layers.map(l => this.layerStyle(l))];
                }

                function addSources(style) {
                    var sources = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                    // sources don't need any special treatment?
                    style.sources = _objectSpread2(_objectSpread2({}, style.sources), sources);
                }

                function transformStyle(style) {
                    var transformFunc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : StyleSpecification => StyleSpecification;
                    style = transformFunc(style);
                }

                function mixStyles(style) {
                    var mixStyles = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                    Object.keys(mixStyles).forEach(sourceId => {
                        var layers = mixStyles[sourceId].layers;
                        delete mixStyles[sourceId].layers;
                        style.sources[sourceId] = mixStyles[sourceId];
                        style.layers = [...style.layers, ...layers.map(l => this.layerStyle(_objectSpread2({
                            source: sourceId
                        }, l)))];
                    });
                }

                if (!params.style) {
                    params.style = {
                        version: 8,
                        layers: [],
                        sources: {}
                    };
                }

                if (options.addLayers || options.addSources || options.transformStyle || options.mixStyles) {
                    var styleParam = params.style;
                    var style;

                    if (typeof styleParam === 'string') {
                        var styleUrl = styleParam.replace(/^mapbox:\/\/styles\//, 'https://api.mapbox.com/styles/v1/');
                        var response = yield fetch(styleUrl);
                        style = yield response.json();
                    } else {
                        style = styleParam;
                    }

                    var u = new MapGlUtils();
                    addLayers.call(u, style, options.addLayers);
                    addSources(style, options.addSources);
                    transformStyle(style, options.transformStyle);
                    mixStyles.call(u, style, options.mixStyles);
                    params.style = style;
                }

                var map = new mapboxgl.Map(params);
                MapGlUtils.init(map, mapboxgl);
                return map;
            })();
        }
        /** Sets Map's cursor to 'pointer' whenever the mouse is over these layers.
            @returns A function to remove the handler.
         */


        hoverPointer(layerOrLayers) {
            var layers = resolveArray(layerOrLayers, this.map);

            var mouseenter = e => this.map.getCanvas().style.cursor = 'pointer';

            var mouseleave = e => {
                // don't de-hover if we're still over a different relevant layer
                if (this.map.queryRenderedFeatures(e.point, {
                    layers
                }).length === 0) {
                    this.map.getCanvas().style.cursor = oldCursor;
                }
            };

            var oldCursor = this.map.getCanvas().style.cursor;

            for (var layer of layers) {
                this.map.on('mouseleave', layer, mouseleave);
                this.map.on('mouseenter', layer, mouseenter);
            }

            return () => {
                for (var _layer of layers) {
                    this.map.off('mouseenter', _layer, mouseenter);
                    this.map.off('mouseleave', _layer, mouseleave);
                }

                this.map.getCanvas().style.cursor = oldCursor;
            };
        }
        /**
        Updates feature-state of features in the connected source[s] whenever hovering over a feature in these layers.
        @param layer Layer(s) to add handler to.
        @param {string|Array} [source] Source whose features will be updated. If not provided, use the source defined for the layer.
        @param {string} [sourceLayer] Source layer (if using vector source)
        */


        /** Show a popup whenever hovering over a feature in these layers.
        @param {string|Array<string>|RegExp|function} layers Layers to attach handler to.
        @param htmlFunc Function that receives feature and popup, returns HTML.
        @param {Object<PopupOptions>} popupOptions Options passed to `Popup()` to customise popup.
        @example hoverPopup('mylayer', f => `<h3>${f.properties.Name}</h3> ${f.properties.Description}`, { anchor: 'left' });
        */
        hoverPopup(layers, htmlFunc) {
            var popupOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            if (!this._mapgl) {
                throw 'Mapbox GL JS or MapLibre GL JS object required when initialising';
            }

            var popup = new this._mapgl.Popup(_objectSpread2({
                closeButton: false
            }, popupOptions));
            return arrayifyAndOff(function (layer, htmlFunc) {
                var mouseenter = e => {
                    if (e.features[0]) {
                        popup.setLngLat(e.lngLat);
                        popup.setHTML(htmlFunc(e.features[0], popup));
                        popup.addTo(this.map);
                    }
                };

                var mouseout = e => {
                    popup.remove();
                };

                this.map.on('mouseenter', layer, mouseenter);
                this.map.on('mouseout', layer, mouseout);
                return () => {
                    this.map.off('mouseenter', layer, mouseenter);
                    this.map.off('mouseout', layer, mouseout);
                    mouseout();
                };
            }).call(this, layers, htmlFunc);
        }
        /** Show a popup whenever a feature in these layers is clicked.
            @param {string|Array<string>|RegExp|function} layers Layers to attach handler to.
            @param htmlFunc Function that receives feature and popup, returns HTML.
            @param {Object<PopupOptions>} popupOptions Options passed to `Popup()` to customise popup.
             @returns A function that removes the handler.
            @example clickPopup('mylayer', f => `<h3>${f.properties.Name}</h3> ${f.properties.Description}`, { maxWidth: 500 });
         */


        clickPopup(layers, htmlFunc) {
            var popupOptions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            if (!this._mapgl) {
                throw 'Mapbox GL JS or Maplibre GL JS object required when initialising';
            }

            var popup = new this._mapgl.Popup(_objectSpread2({}, popupOptions));
            return arrayifyAndOff(function (layer, htmlFunc) {
                var click = e => {
                    if (e.features[0]) {
                        popup.setLngLat(e.features[0].geometry.coordinates.slice());
                        popup.setHTML(htmlFunc(e.features[0], popup));
                        popup.addTo(this.map);
                    }
                };

                this.map.on('click', layer, click);
                return () => this.map.off('click', layer, click);
            }).call(this, layers, htmlFunc);
        }
        /** Fire a callback whenever a feature in these layers is clicked.
            @param {string|Array<string>|RegExp|function} layers Layers to attach handler to.
            @param {function} cb Callback that receives event with .features property
            @returns A function that removes the handler.
        */


        /**
        Detects a click in the first of a series of layers given, and fires a callback.
        @param {string|Array<string>|RegExp|function} layers Layers to attach handler to.
        @param cb Callback, receives `{ event, layer, feature, features }`.
        @param noMatchCb Callback when a click happens that misses all these layers. Receives `{ event }`.
        @returns A function to remove the handler.
        */
        clickOneLayer(layerRef, cb, noMatchCb) {
            var layers = resolveArray(layerRef, this.map);

            var click = e => {
                var match = false;

                for (var layer of layers) {
                    var features = this.map.queryRenderedFeatures(e.point, {
                        layers: [layer]
                    });

                    if (features[0]) {
                        try {
                            cb({
                                event: e,
                                layer,
                                feature: features[0],
                                features
                            });
                        } finally {
                            match = true;
                            break;
                        }
                    }
                }

                if (!match && noMatchCb) {
                    noMatchCb(e);
                }
            };

            this.map.on('click', click);
            return () => this.map.off('click', click);
        }
        /**
        Fires a callback when mouse hovers over a feature in these layers.
        @param {string|Array<string>|RegExp|function} layers Layers to attach handler to.
        @returns A function to remove the handler.
        */


        _mapAddLayerBefore(layerDef, beforeLayerId) {
            if (beforeLayerId) {
                this.map.addLayer(layerDef, beforeLayerId);
            } else {
                this.map.addLayer(layerDef);
            }
        }
        /** Adds a layer, given an id, source, type, and properties.
         */


        addLayer(id, source, type, props, before) {
            this._mapAddLayerBefore(this.layerStyle(id, source, type, props), before);

            return this._makeSource(source);
        } // TODO deprecate/remove?


        add(id, source, type, props, before) {
            this._mapAddLayerBefore( // $FlowFixMe// technically this doesn't work for layer of type 'background'
                _objectSpread2(_objectSpread2({}, this.properties(props)), {}, {
                    id,
                    type,
                    source: parseSource(source)
                }), before);

            if (typeof source === 'string') {
                return this._makeSource(source);
            }
        }

        setLayer(layerId, source, type, props, before) {
            var layerDef = this.layerStyle(layerId, source, type, props);
            var style = this.map.getStyle();
            var layerIndex = style.layers.findIndex(l => l.id === layerDef.id);
            var beforeIndex = style.layers.findIndex(l => l.id === before);

            if (layerIndex >= 0) {
                style.layers.splice(layerIndex, 1, layerDef);
            } else if (beforeIndex >= 0) {
                style.layers.splice(beforeIndex, 0, layerDef);
            } else {
                style.layers.push(layerDef);
            }

            this.map.setStyle(style);
            return this._makeSource(source);
        }

        // The bodies of these functions are added later by `makeAddLayer`

        /** Adds a layer of type `line`.*/
        addLineLayer(id, props, before) { }
        /** Adds a layer of type `fill`.*/


        addFillLayer(id, props, before) { }
        /** Adds a layer of type `circle`.*/


        addCircleLayer(id, props, before) { }
        /** Adds a layer of type `symbol`.*/


        addSymbolLayer(id, props, before) { }
        /** Adds a layer of type `video`.*/


        addVideoLayer(id, props, before) { }
        /** Adds a layer of type `raster`.*/


        addRasterLayer(id, props, before) { }
        /** Adds a layer of type `fill-extrusion`.*/


        addFillExtrusionLayer(id, props, before) { }
        /** Adds a layer of type `heatmap`.*/


        addHeatmapLayer(id, props, before) { }
        /** Adds a layer of type `hillshade`.*/


        addHillshadeLayer(id, props, before) { }
        /** Create a GeoJSON layer. */


        addGeoJSONSource(id) {
            var geojson = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
                type: 'FeatureCollection',
                features: []
            };
            var props = arguments.length > 2 ? arguments[2] : undefined;
            return this.addSource(id, _objectSpread2({
                type: 'geojson',
                data: geojson
            }, props));
        }

        addGeoJSON(id) {
            var geojson = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
                type: 'FeatureCollection',
                features: []
            };
            var props = arguments.length > 2 ? arguments[2] : undefined;
            return this.addGeoJSONSource(id, geojson, props);
        }

        addSource(id, sourceDef) {
            var style = this.map.getStyle();
            style.sources[id] = sourceDef;
            this.map.setStyle(style);
            return this._makeSource(id);
        }

        layersBySource(source) {
            return this.map.getStyle().layers.filter(l => l.source === source).map(l => l.id);
        }
        /** Adds a `vector` source
        @param sourceId ID of the new source.
        @param {string} [data] Optional URL of source tiles (.../{z}/{x}/{y}...), mapbox:// URL or TileJSON endpoint.
        @param {object} props Properties defining the source, per the style spec.
         @example addVector('mysource', 'http://example.com/tiles/{z}/{x}/{y}.pbf', { maxzoom: 13 });
        */


        addVectorSource(sourceId, props) {
            var extraProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            if (typeof props === 'string') {
                if (props.match(/\{z\}/)) {
                    return this.addSource(sourceId, _objectSpread2(_objectSpread2({}, extraProps), {}, {
                        type: 'vector',
                        tiles: [props]
                    }));
                } else {
                    // mapbox://, http://.../index.json
                    return this.addSource(sourceId, _objectSpread2(_objectSpread2({}, extraProps), {}, {
                        type: 'vector',
                        url: props
                    }));
                }
            } else {
                return this.addSource(sourceId, _objectSpread2(_objectSpread2({}, props), {}, {
                    type: 'vector'
                }));
            }
        }

        addVector(sourceId, props) {
            var extraProps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
            return this.addVectorSource(sourceId, props, extraProps);
        }
        /** Adds a `raster` source
        @param sourceId ID of the new source.
        @param {object} props Properties defining the source, per the style spec.
        */


        addRasterSource(sourceId, props) {
            return this.addSource(sourceId, _objectSpread2(_objectSpread2({}, props), {}, {
                type: 'raster'
            }));
        }
        /** Adds a `raster-dem` source
        @param sourceId ID of the new source.
        @param {object} props Properties defining the source, per the style spec.
        */


        addRasterDemSource(sourceId, props) {
            return this.addSource(sourceId, _objectSpread2(_objectSpread2({}, props), {}, {
                type: 'raster-dem'
            }));
        }
        /** Adds a `raster` source
        @param sourceId ID of the new source.
        @param {object} props Properties defining the source, per the style spec.
        */


        addRasterSource(sourceId, props) {
            return this.addSource(sourceId, _objectSpread2(_objectSpread2({}, props), {}, {
                type: 'raster'
            }));
        }
        /** Adds an `image` source
        @param sourceId ID of the new source.
        @param {object} props Properties defining the source, per the style spec.
        */


        addImageSource(sourceId, props) {
            return this.addSource(sourceId, _objectSpread2(_objectSpread2({}, props), {}, {
                type: 'image'
            }));
        }
        /** Adds a `video` source
        @param sourceId ID of the new source.
        @param {object} props Properties defining the source, per the style spec.
        */


        addVideoSource(sourceId, props) {
            return this.addSource(sourceId, _objectSpread2(_objectSpread2({}, props), {}, {
                type: 'video'
            }));
        }
        /** Sets a paint or layout property on one or more layers.
        @example setProperty(['buildings-fill', 'parks-fill'], 'fillOpacity', 0.5)
        */


        /** Converts a set of properties in pascalCase or kebab-case into a layer objectwith layout and paint properties. */
        properties(props) {
            if (!props) {
                return undefined;
            }

            var out = {},
                which = {
                    paint: {},
                    layout: {},
                    other: {}
                };
            Object.keys(props).forEach(prop => {
                var kprop = kebabCase(prop);
                which[whichProp(kprop)][kprop] = props[prop];
            });

            if (Object.keys(which.paint).length) {
                out.paint = which.paint;
            }

            if (Object.keys(which.layout).length) {
                out.layout = which.layout;
            }

            Object.assign(out, which.other);
            return out;
        } // layerStyle([id,] [source,] [type,] props)
        // TODO somehow make this type safe.


        layerStyle() {
            for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            var [id, source, type] = args;
            var props = args.find(arg => typeof arg === 'object' && !Array.isArray(arg));
            var ret = typeof props === 'object' ? this.properties(props) || {} : {};
            if (typeof id === 'string') ret.id = id;
            if (typeof source === 'string') ret.source = source;
            if (typeof type === 'string') ret.type = type;
            return ret;
        }
        /** Gets the layer definition for a given layer id, as per the style spec..
         */


        getLayerStyle(layerId) {
            return this.map.getStyle().layers.find(l => l.id === layerId);
        }

        /** Replaces the current data for a GeoJSON layer.
        @param sourceId Id of the source being updated.
        @param {GeoJSON} [data] GeoJSON object to set. If not provided, defaults to an empty FeatureCollection.
        */
        setData(sourceId) {
            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
                type: 'FeatureCollection',
                features: []
            };
            this.map.getSource(sourceId).setData(data);
        }
        /** Makes the given layers visible.
        @param {string|Array<string>|RegExp|function} Layer to toggle.
        */


        /** Callback that fires when map loads, or immediately if map is already loaded.
        @returns {Promise} Promise, if callback not provided.
        */
        onLoad(cb) {
            if (!cb) {
                return new Promise(resolve => this.onLoad(resolve));
            } else {
                if (this.map.loaded() || this._loaded) {
                    cb();
                } else {
                    this.map.once('load', () => {
                        this._loaded = true;
                        cb();
                    });
                }
            }
        }
        /** Set a property on the style's root, such as `light` or `transition`. */


        setRootProperty(propName, val) {
            var style = this.map.getStyle();
            style[kebabCase(propName)] = val;
            this.map.setStyle(style);
        }
        /** Sets root transition property.
        @example setTransition({ duration: 500, delay: 100 })
        */


        setTransition(val) {
            this.setRootProperty('transition', val);
        }
        /** Adds an image for use as a symbol layer, from a URL.
        @example loadImage('marker', '/assets/marker-pin@2x.png', { pixelRatio: 2})
        */


        loadImage(id, url, options) {
            if (typeof url === 'string'
                /* && url.match(/\.[a-z]+$/)*/
            ) {
                return new Promise((resolve, reject) => {
                    this.map.loadImage(url, (error, image) => {
                        if (error) {
                            console.error("Error loading image ".concat(url), error);
                            reject("Error loading image ".concat(url));
                        } else {
                            this.map.addImage(id, image, options);
                            resolve(id);
                        }
                    });
                });
            } else {
                return this.map.addImage(id, url, options);
            }
        }

        lockOrientation() {
            this.map.touchZoomRotate.disableRotation();
            this.map.dragRotate.disable();
        }
        /** Gets array of font names in use, determined by traversing style. Does not detect fonts in all possible situations.
        @returns {Array[string]}  */


        fontsInUse() {
            // TODO add tests
            // TODO: find fonts burried within ['format', ... { 'text-font': ... }] expressions
            function findLiterals(expr) {
                if (Array.isArray(expr)) {
                    if (expr[0] === 'literal') {
                        ///
                        fonts.push(...expr[1]);
                    } else {
                        expr.forEach(findLiterals);
                    }
                }
            }

            var fonts = [];
            var fontExprs = this.map.getStyle().layers.map(l => l.layout && l.layout['text-font']).filter(Boolean);

            for (var fontExpr of fontExprs) {
                // if top level expression is an array of strings, it's hopefully ['Arial', ...] and not ['get', 'font']
                if (fontExpr.stops) {
                    // old-school base/stops
                    // TODO verify we have got all the cases
                    try {
                        fonts.push(...fontExpr.stops.flat().filter(Array.isArray).flat());
                    } catch (_unused) {
                        console.log("Couldn't process font expression:", fontExpr);
                    }
                } else if (fontExpr.every(f => typeof f === 'string')) {
                    fonts.push(...fontExpr);
                } else {
                    findLiterals(fontExpr);
                }
            }

            return [...new Set(fonts)];
        }

        _makeSource(sourceId) {
            // returns an object on which we can call .addLine() etc.
            var out = new MapGlUtils();
            out.map = this.map;
            out._mapgl = this._mapgl;
            layerTypes.forEach(function (type) {
                makeAddLayer(type, out, sourceId);
            });
            return out;
        }

    } // idempotent version


    var makeAddLayer = (layerType, obj, fixedSource) => {
        var func;

        if (fixedSource) {
            func = function func(id, options, before) {
                return this.setLayer(id, fixedSource, layerType, options, before);
            };
        } else {
            func = function func(id, source, options, before) {
                return this.setLayer(id, source, layerType, options, before);
            };
        }

        var upType = upperCamelCase(layerType); //$FlowFixMe[prop-missing]

        obj["add".concat(upType)] = func; //$FlowFixMe[prop-missing]

        obj["add".concat(upType, "Layer")] = func;
    }; // Object.assign(Utils.prototype, UtilsExtra);


    function initClass(U) {
        var makeSetProp = (prop, setPropFunc) => {
            var funcName = 'set' + upperCamelCase(prop); //$FlowFixMe[prop-missing]

            U[funcName] = arrayify(function (layer, value) {
                return this.map[setPropFunc](layer, prop, value);
            });
        };

        var makeGetProp = (prop, getPropFunc) => {
            var funcName = 'get' + upperCamelCase(prop); //$FlowFixMe[prop-missing]

            U[funcName] = arrayify(function (layer) {
                return this.map[getPropFunc](layer, prop);
            });
        };


        U.update = U.setData; // deprecated
        // Turn every property into a 'setTextSize()', 'setLineColor()' etc.

        allProps.paints.forEach(prop => makeSetProp(prop, 'setPaintProperty'));
        allProps.layouts.forEach(prop => makeSetProp(prop, 'setLayoutProperty'));
        allProps.paints.forEach(prop => makeGetProp(prop, 'getPaintProperty'));
        allProps.layouts.forEach(prop => makeGetProp(prop, 'getLayoutProperty'));
        layerTypes.forEach(layerType => makeAddLayer(layerType, U));
    }

    var U = MapGlUtils.prototype;
    initClass(U);

    return MapGlUtils;

})));

