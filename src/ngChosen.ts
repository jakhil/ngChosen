/// <reference path="../typings/angularjs/angular.d.ts" />
module ngChosen {
	"use strict";

	class AngularChosenDirective implements ng.IDirective {
		private updateState(element: any, loading: boolean, disabled: boolean, showNoResultsText: boolean): void {
			element.toggleClass("loading", loading).attr("disabled", disabled);

			var selectText = element.attr("select-text");
			var noResultsText = element.attr("no-results-text");
			this.updatePlaceholder(element, showNoResultsText ? noResultsText : selectText);

			this.triggerUpdate(element);
		}

		private isEmpty(object: any): boolean {
			if (angular.isArray(object)) {
				return object.length === 0;
			} else if (angular.isObject(object)) {
				var key;
				for (key in object) {
					if (object.hasOwnProperty(key)) {
						return false;
					}
				}
			}
			return true;
		}

		private triggerUpdate(element: any): void {
			if (element) {
				element.trigger("chosen:updated");
			}
		}

		private updatePlaceholder(element: any, text: string): void {
			element.attr("data-placeholder", text);
		}

        restrict = "A";
        require = "?ngModel";
        scope = {
			noResultsText: "@",
			selectText: "@",
			datasource: "=",
			onChange: "&",
			placeholder: "@",
			allowSingleDeselect: "@",
			disableSearch: "@",
			enableSplitWordSearch: "&",
                        ngModel: '='
        };
        link = (scope: any, element: any, attributes: any, ngModelCtrl: ng.INgModelController) => {
			var elem = element;
			elem.addClass("ng-chosen").chosen({
				placeholder_text_multiple: scope.selectText,
				placeholder_text_single: scope.selectText,
				no_results_text: scope.noResultsText,
				allow_single_deselect: scope.allowSingleDeselect,
				disable_search: scope.disableSearch,
				enable_split_word_search: scope.enableSplitWordSearch()
			});

			elem.chosen().change(() => {
				if(scope.onChange) {
					scope.onChange();
				}
			});

			if(elem.attr("datasource") !== undefined) {
				scope.$watchCollection("datasource", (newValue, oldValue) => {
					if (angular.isUndefined(newValue)) {
						this.updateState(elem, true, true, true);
					} else if (this.isEmpty(newValue)) {
						this.updateState(elem, false, true, true);
					} else {
						this.updateState(elem, false, false, false);
					}
				});
			} else {
				this.updateState(elem, false, false, false);
			}
            
	               if (scope.ngModel !== undefined) {
			        scope.$watch("ngModel", function(newValue, oldValue) {
			               if (!angular.isUndefined(newValue) && !this.isEmpty(newValue)  && newValue !== oldValue) {
			                        this.triggerUpdate(elem);
			                }
	        	        }, true);
	                }

			attributes.$observe("selectText", (newValue) => {
				this.updatePlaceholder(elem, newValue);
				this.triggerUpdate(elem);
			});

			if (ngModelCtrl) {
				var origRender = ngModelCtrl.$render;
				ngModelCtrl.$render = () => {
					origRender();
					this.triggerUpdate(elem);
				};
				if (attributes.multiple) {
					scope.$watch(function() {
						ngModelCtrl.$viewValue;
					}, ngModelCtrl.$render, true);
				}
			}
        }
    }

    /*@ngInject*/
    function directive(): ng.IDirective {
        return new AngularChosenDirective();
    }

    angular.module("ngChosen", []);
    angular.module("ngChosen").directive("ngChosen", directive);
}
