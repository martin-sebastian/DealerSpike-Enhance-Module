<script src="//cdnjs.cloudflare.com/ajax/libs/numeral.js/2.0.6/numeral.min.js"></script>;

var elements = $('.itemTitle a[href$="i"]');
var units = [];
$.each(elements, function (index, el) {
  var muID = el.href.trim().split("/").reverse()[0];
  muID = muID.split("-").reverse()[0];
  muID = muID.replace("i", "");
  $.ajax({
    type: "GET",
    url:
      "https://newportal.flatoutmotorcycles.com/portal/api/instantquote/b50link/" +
      muID,
  })
    .done(function (data) {
      // push data into the units array
      var portalMSRP = numeral(data.MSRP).format("$0,0.00");
      var stockNumber = data.StockNumber;
      if (data.QuoteLevel > 1 && data.MSRP > 0) {
        var itemDetail = $(el).closest(".itemDetail");
        var itemMedia = itemDetail.siblings(".itemMedia");

        itemMedia.addClass("has-sale-media");
        itemDetail.addClass("has-sale");
      }

      // add promo label rules here
      if (data.QuoteLevel == 2) {
        var promoLabel = "FACTORY PROMO";
        var portalMSRP = portalMSRP;
      } else {
        var promoLabel = "ON SALE";
        var portalMSRP = portalMSRP;
      }

      var portalOverlay = `
            <a href="${data.DetailUrl}" title="Click for Promo or Sale Price Details">
                <div class="portal-promo"><span><i class="fa fa-bolt has-sale-bolt"></i> ${promoLabel}</span></div>
            </a>
            <span class="portal-msrp">${portalMSRP}</span>
            <span class="stock-number">${stockNumber}</span>
            <a href="${data.DetailUrl}" class="btn btn-primary get-quote-btn" title="Click to see pricing, discounts, sales, rebates, status and more">
                <i class="fa fa-bolt has-sale-bolt"></i> INSTANT QUOTE
            </a>
            `;

      $(".has-sale").find(".itemPrice").replaceWith(portalOverlay);

      var style = document.createElement("style");
      style.innerHTML = `
                .portal-promo {
                    position: absolute;
                    top: 5px;
                    left: 5px;
                }
                
                .portal-promo span {
                    font-size: 90%;
                    background: rgba(0, 0, 0, 0.8);
                    border-radius: 5px;
                    color: white;
                    font-weight: bold;
                    padding: 5px 15px 5px 10px;
                }
                .portal-promo span:hover {
                    background: rgba(221, 31, 38, 0.9);
                }
                .has-sale-bolt {
                    font-size: 14px;
                    color: #eeff0a;
                    padding: 0 5px;
                }
                .has-sale-media a.sft-ribbon-mask {
                    display: none;
                }
                .portal-msrp {
                    font-weight: bold;
                    font-style: italic;
                    text-decoration: line-through;
                    line-height: 30px;
                }
                .get-quote-btn {
                    display: block;
                    font-size: 11px;
                    font-weight: bold;
                    margin: 0 auto;
                    border-radius: 5px;
                }

                `;
      document.head.appendChild(style);
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.log(jqXHR.responseText || textStatus);
    });
});
