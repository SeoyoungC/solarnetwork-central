<a id="top"></a>

<p class="intro">
	<fmt:message key='billing.intro'/>
</p>

<section id="outstanding-invoices" class="hidden">
	<h2>
		<fmt:message key='billing.outstandingInvoiceList.header'/>
	</h2>
	<p class="intro">
		<fmt:message key='billing.outstandingInvoiceList.intro'>
			<fmt:param value="0"/>
		</fmt:message>
	</p>
	<table class="table unpaid" id="outstanding-invoice-list-table">
		<thead>
			<tr>
				<th><fmt:message key="billing.invoice.number.label"/></th>
				<th><fmt:message key="billing.invoice.date.label"/></th>
				<th><fmt:message key="billing.invoice.balance.label"/></th>
			</tr>
			<tr class="template">
				<td><a href="#" data-tprop="invoiceNumber"></a></td>
				<td data-tprop="localizedDate"></td>
				<td><span class="label label-danger" data-tprop="localizedBalance"></span></td>
			</tr>
		</thead>
		<tbody>
		</tbody>
	</table>
</section>

<section id="invoices" class="hidden">
	<h2>
		<fmt:message key='billing.invoiceList.header'/>
	</h2>
	<p class="intro">
		<fmt:message key='billing.invoiceList.intro'>
			<fmt:param value="0"/>
		</fmt:message>
	</p>
	<nav aria-label="<fmt:message key='billing.invoice.pagination.label'/>" id="invoice-list-pagination" class="hidden">
		<ul class="pagination">
			<li><a href="#" aria-label="<fmt:message key='billing.invoice.pagination.prev.label'/>"><span aria-hidden="true">&laquo;</span></a></li>
			<li class="template"><a href="#"><span data-tprop="pageNumber">1</span> <span class="sr-only hidden"><fmt:message key='billing.invoice.pagination.current.label'/></span></a></li>
			<li><a href="#" aria-label="<fmt:message key='billing.invoice.pagination.next.label'/>"><span aria-hidden="true">&raquo;</span></a></li>
		</ul>
	</nav>
	<table class="table" id="invoice-list-table">
		<thead>
			<tr>
				<th><fmt:message key="billing.invoice.number.label"/></th>
				<th><fmt:message key="billing.invoice.date.label"/></th>
				<th><fmt:message key="billing.invoice.amount.label"/></th>
			</tr>
			<tr class="template">
				<td><a href="#" data-tprop="invoiceNumber"></a></td>
				<td data-tprop="localizedDate"></td>
				<td><span class="label label-success" data-tprop="localizedAmount"></span></td>
			</tr>
		</thead>
		<tbody>
		</tbody>
	</table>
</section>

<%-- Modal forms --%>

<div class="modal fade" tabindex="-1" role="dialog" id="invoice-details-modal">
	<div class="modal-dialog" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="<fmt:message key='close.label'/>"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title"><fmt:message key='billing.invoice.details.title'/></h4>
			</div>
			<div class="modal-body container-fluid">
		 		<div class="row">
		 			<div class="col-xs-2">
		 				<p><b><fmt:message key='billing.invoice.number.label'/></b></p>
			 		</div>
		 			<div class="col-xs-6">
		 				<p><b><fmt:message key='billing.invoice.date.label'/></b></p>
			 		</div>
		 			<div class="col-xs-4">
		 				<p><b><fmt:message key='billing.invoice.amount.label'/></b></p>
			 		</div>
		 		</div>
		 		<div class="row">
		 			<div class="col-xs-2">
		 				<p data-tprop="invoiceNumber">123</p>
			 		</div>
		 			<div class="col-xs-6">
		 				<p data-tprop="localizedDate">Monday, August 28, 2017</p>
			 		</div>
		 			<div class="col-xs-4">
		 				<p><span class="label" data-tprop="localizedAmount">$1.23</span></p>
			 		</div>
		 		</div>
			</div>
			<div class="modal-footer">
				<button type="button" class="btn btn-default" data-dismiss="modal"><fmt:message key='close.label'/></button>
			</div>
		</div>
	</div>
</div>
