'use strict';

var React = require('react');
var t = require('tcomb-validation');

var ReactElement = t.irreducible('ReactElement', React.isValidElement);
var ReactNode = t.irreducible('ReactNode', function (x) {
  return t.Str.is(x) || t.Num.is(x) || ReactElement.is(x);
});

function toPropTypes(spec) {

  var propTypes = {};

  if (process.env.NODE_ENV !== 'production') {

    if (t.Obj.is(spec)) {
      spec = t.struct(spec);
    }
    var props = spec.meta.props;

    Object.keys(props).forEach(function (k) {

      // React custom prop validators
      // see http://facebook.github.io/react/docs/reusable-components.html

      propTypes[k] = function (values, name, displayName) {
        var type = props[name];
        var value = values[name];
        var isValid = t.validate(value, type).isValid();
        if (!isValid) {
          var message = t.util.format('Invalid prop `%s` = `%s` supplied to `%s`, should be `%s`', name, value, displayName, t.util.getName(type));
          return new Error(message);
        }
      };

    });

  }

  return propTypes;
}

function Mixin(spec) {

  if (t.Obj.is(spec)) {
    spec = t.struct(spec);
  }

  return {
    propTypes: toPropTypes(spec),
    statics: {
      // attach the spec to component constructor as a static property
      // to allow component runtime reflection
      TcombPropTypes: spec
    }
  };
}

t.react = {
  toPropTypes: toPropTypes,
  Mixin: Mixin,
  ReactElement: ReactElement,
  ReactNode: ReactNode
};

module.exports = t;