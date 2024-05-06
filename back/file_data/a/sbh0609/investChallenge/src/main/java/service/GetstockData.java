package service;
import DAO.GetstockCode;

public class GetstockData {
	
	public String OnlyPrice(String searchWord) {
    	GetapiData gad = new GetapiData();
    	GetstockCode getcode = new GetstockCode();
    	String stock_code = getcode.getStockCode(searchWord);
    	
    	String livestock = gad.LiveStockPrice(stock_code);
    	return livestock;
    }
    
    public String[][] StockDailyInfo(String searchWord){
    	GetapiData gad = new GetapiData();
    	GetstockCode getcode = new GetstockCode();
    	String stock_code = getcode.getStockCode(searchWord);
    	
    	String[][] useforChart =  gad.DailyChartprice(stock_code);
    	return useforChart;
    }
	
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		GetstockData gsd = new GetstockData();
		String a = gsd.OnlyPrice("LG");
		System.out.println(a);
	}

}
