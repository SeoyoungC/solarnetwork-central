$(document).ready(function() {
	'use strict';
	
	var invoicePagination = {
		page: 0,
		total: 0,
		pageSize: 10,
	};
	
	function renderInvoiceTableRows(tbody, templateRow, results) {
		var i, len, tr, invoice, prop, cell;
		tbody.empty();
		if ( results.length > 0 ) {
			for ( i = 0, len = results.length; i < len; i += 1 ) {
				tr = templateRow.clone(true);
				tr.removeClass('template');
				invoice = results[i];
				tr.data('invoice', invoice);
				for ( prop in invoice ) {
					if ( invoice.hasOwnProperty(prop) ) {
						cell = tr.find("[data-tprop='" +prop +"']");
						cell.text(invoice[prop]);
					}
				}
				tbody.append(tr);
			}
		}
	}
	
	function renderInvoiceTable(table, pagination, displayCount, json) {
		var haveRows = json && json.data && json.data.results.length > 0;
		var total = (json.data ? json.data.totalResults : returned);
		if ( haveRows ) {
			var table = $(table);
			var templateRow = table.find('tr.template');
			var tbody = table.find('tbody');
			renderInvoiceTableRows(tbody, templateRow, json.data.results);
		}
		if ( pagination ) {
			var offset = (json.data ? json.data.startingOffset : 0);
			var returned = (haveRows ? json.data.results.length : 0);
			var pageCount = Math.ceil(total / invoicePagination.pageSize);
			var page = (offset / invoicePagination.pageSize);
			var haveMore = (offset + returned < total);
			
			var pageNav = $(pagination);
			var paginationListItems = pageNav.find('li');
			paginationListItems.not(':first').not(':last').not('.template').remove();
			
			var prevItem = paginationListItems.first();
			prevItem.toggleClass('disabled', !(offset > 0));
			
			var nextItem = paginationListItems.last();
			nextItem.toggleClass('disabled', !haveMore);

			var templateItem = paginationListItems.filter('.template');
			
			var i, len, pageItem;
			for ( i = 0, len = pageCount; i < len; i += 1 ) {
				pageItem = templateItem.clone(true).removeClass('template');
				if ( i === page ) {
					pageItem.addClass('active');
				}
				pageItem.find("[data-tprop='pageNumber']").text(i+1);
				pageItem.find('a').attr('href', '#'+i);
				pageItem.insertBefore(nextItem);
			}
			
			invoicePagination.total = total;
			invoicePagination.page = page;
			
			pageNav.toggleClass('hidden', pageCount < 2);
		}
		$(displayCount).text(total);
		return haveRows;
	}
	
	function loadInvoicePage(pageNum) {
		console.log('Want page %d', pageNum);
		$.getJSON(SolarReg.solarUserURL('/sec/billing/invoices/list?unpaid=false&offset=' 
				+(pageNum * invoicePagination.pageSize)
				+'&max=' +invoicePagination.pageSize), function(json) {
			console.log('Got invoices: %o', json);
			var havePaid = renderInvoiceTable('#invoice-list-table', '#invoice-list-pagination', 
					'.invoiceListCount', json);
			$('#invoices').toggleClass('hidden', !havePaid);
		});
	}
	
	$('#outstanding-invoices').each(function() {
		
		// setup pagination links
		var paginationListItems = $('#invoice-list-pagination li');
		paginationListItems.first().find('a').on('click', function(event) {
			event.preventDefault();
			loadInvoicePage(invoicePagination.page - 1);
		});
		paginationListItems.filter('.template').find('a').on('click', function(event) {
			event.preventDefault();
			var page = +this.hash.substring(1);
			loadInvoicePage(page);
		});
		paginationListItems.last().find('a').on('click', function(event) {
			event.preventDefault();
			loadInvoicePage(invoicePagination.page + 1);
		});
		
		/*
		$.getJSON(SolarReg.solarUserURL('/sec/billing/systemInfo'), function(json) {
			console.log('Got billing info: %o', json);
		});
		*/
		// get unpaid invoices
		$.getJSON(SolarReg.solarUserURL('/sec/billing/invoices/list?unpaid=true'), function(json) {
			console.log('Got unpaid invoices: %o', json);
			var haveUnpaid = renderInvoiceTable('#outstanding-invoice-list-table', null, 
					'.outstandingInvoiceListCount', json);
			$('#outstanding-invoices').toggleClass('hidden', !haveUnpaid);
		});
		
		// get all invoices
		loadInvoicePage(0);

		return false; // break on each()
	});
	
});