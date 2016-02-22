define(['listview/DataSource', 'shared/js/client'], function(DataSource, Client) {

	return DataSource.extend({

		ajaxLoadData: function(options) {

			//不传pageSize参数
			//			delete options.data[this.options.pageSizeParam];

			var me = this;
			Client.ajax({
				url: options.url,
				type: options.type || 'POST',
				data: options.data,
				success: function(response) {
					if (response && response.success) {
						//mark as finish
						if (response.data && (response.data.length === 0 || //
								(response.data.data && (response.data.total == response.data.data.length + me.size() //
									|| response.data.data.length < options.data[me.options.pageSizeParam])))) {
							/*if (response.data || response.data.length == 0 && response.data.data && 
									(response.data.data.length == 0 || response.data.total == response.data.data.length + me.size() 
										|| response.data.data.length < options.data[me.options.pageSizeParam])) {*/
							me.setFinish();
						};
						//callback
						options.success(response.data);
					} else {
						options.fail(response.data);
					}
				},
				error: function(xhr, status) {
					options.fail(xhr, status);
				}
			});
		}
	});
});