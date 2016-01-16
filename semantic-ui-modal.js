/* global SemanticModal:true */
var templateAttach = function(template, setupCallback, data) {
  var instance;
  if (typeof template === 'string') template = Template[template];
  if (!template) return false;
  if (data)
    instance = Blaze.renderWithData(template, data, document.body);
  else
    instance = Blaze.render(template, document.body);
  return setupCallback && setupCallback.call(this, instance);
};

function _setupAndShow (instance, options, refresh, renderedCallback) {
  options = options || {};
  options.modalSettings = options.modalSettings || {};

  var onApprove = _.wrap(options.onApprove, function (func) {
    var result = true;
    if ( typeof func === "function" ) {
      var funcResult = func.apply(this, arguments);
      if ( funcResult === false ) result = false;
    }

    // Legacy.
    if ( typeof options.callback === "function" ) options.callback.call(this, options);

    return result;
  });

  var onDeny = _.wrap(options.onDeny, function (func) {
    var result = true;
    if ( typeof func === "function" ) {
      var funcResult = func.apply(this, arguments);
      if ( funcResult === false ) result = false;
    }
    return result;
  });

  var onVisible = _.wrap(options.onVisible, function (func) {
    if ( typeof func === "function" ) func.apply(this, arguments);

    // Legacy.
    if ( typeof options.postRender === "function" ) options.postRender.call(this, instance, options);
  });

  var onHidden = _.wrap(options.onHidden, function (func) {
    Blaze.remove(instance);
    if ( typeof func === "function" ) func.apply(this, arguments);
  });

  // If noButtons is set, then we MUST be closable via click-off.
  var closable = options.closable;
  if ( options.noButtons ) closable = true;

  var modalSettings = _.extend( {}, options.modalSettings, {
    closable: closable,
    onShow: options.onShow,
    onHide: options.onHide,
    onApprove: onApprove,
    onDeny: onDeny,
    onVisible: onVisible,
    onHidden: onHidden
  });

  // Setup the modal, and store the variable in the instance.
  var modal = instance.modal = $(instance.firstNode()).modal(modalSettings);

  // Show it.
  modal.modal('show');

  // Refresh, if requeseted.
  if ( refresh ) modal.modal('refresh');

  // Fire a callback with the modal.
  if ( typeof renderedCallback === "function" ) renderedCallback.call(instance, modal);

  // Return it, in case someone wants it.
  return modal;
}

var confirmModal = function(options, postRender) {
  var data = _.pick(options,
    'message',
    'header',
    'noButtons',
    'cancelButtonText',
    'confirmButtonText'
  );

  _.defaults(data,
    {
      'confirmButtonText': 'Okay',
      'cancelButtonText': 'Cancel'
    }
  );

  templateAttach(
    Template.confirmModalWrapper,
    function (instance) {
      // Setup the modal, and store the variable in the instance.
      _setupAndShow(instance, options);
    },
    data
  );
};

var generalModal = function(template, data, options) {
  templateAttach(
    Template.generalModalWrapper,
    function (instance) {
      // Setup and also refresh it, since it's usually wrong for custom content.
      _setupAndShow(instance, options, true);
    },
    {
      dataContext: data,
      templateName: template,
      modalClass: options.modalClass
    }
  );
};

SemanticModal = {
  confirmModal: confirmModal,
  generalModal: generalModal
};
