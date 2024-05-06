package service;

public class SellBuyPrice {
	public Integer sbPrice(String searchWord, Integer num) {
		GetstockData gsd = new GetstockData();
		Integer currentprice = Integer.parseInt(gsd.OnlyPrice(searchWord));
		Integer sbprice = currentprice*num;
		return sbprice;
	}
}
