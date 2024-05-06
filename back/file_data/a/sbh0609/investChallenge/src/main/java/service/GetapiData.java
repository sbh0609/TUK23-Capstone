package service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.List;
import org.json.JSONArray;
import org.json.JSONObject;

import utility.ConnectKIS;

import java.text.SimpleDateFormat;


public class GetapiData {
	private String apiKey = System.getenv("KISAPP_KEY");
    private String apiSecret = System.getenv("KISSECRET_KEY");
    private static final String URL_BASE = "https://openapi.koreainvestment.com:9443";
    
     //주식 현재가를 조회하는 메소드
    public String LiveStockPrice(String stock_code) {
    	String token = new ConnectKIS().readTokenFromFile();
        StringBuilder response = new StringBuilder();
        String nowprice = null;
        try {
            String path = "uapi/domestic-stock/v1/quotations/inquire-price";
            URL url = new URL(URL_BASE + "/" + path + "?fid_cond_mrkt_div_code=J&fid_input_iscd=" + stock_code);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("GET");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setRequestProperty("authorization", "Bearer " + token);
            conn.setRequestProperty("appKey", apiKey);
            conn.setRequestProperty("appSecret", apiSecret);
            conn.setRequestProperty("tr_id", "FHKST01010100");
            
            int responseCode = conn.getResponseCode();
            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                String inputLine;	

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();
//                System.out.println(response.toString());
                JSONObject jsonResponse = new JSONObject(response.toString());
                nowprice = jsonResponse.getJSONObject("output").getString("stck_prpr");
                
            } else if (responseCode == 500) { // 토큰 만료 시 재발급
                new ConnectKIS().issueToken();
            } else {
                System.out.println("Error Code: " + responseCode);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: Exception occurred";
        }
//        return response.toString();
        return nowprice;
    }
    
    public String[][] DailyChartprice(String stock_code) {
    	 String token = new ConnectKIS().readTokenFromFile();
    	 StringBuilder response = new StringBuilder();
//         현재 날짜 yyyymmdd
         SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd"); 
         Calendar c1 = Calendar.getInstance();
         String strToday = sdf.format(c1.getTime());
         String[][] revchartData = null;
         String[][] ChartData = null;
         try {
        	 String path = "uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice";
        	 URL url = new URL(URL_BASE + "/" + path + "?fid_cond_mrkt_div_code=J&fid_input_iscd=" + stock_code + "&fid_input_date_1=20231101&fid_input_date_2="+strToday+"&fid_org_adj_prc=0&fid_period_div_code=D");
        	 HttpURLConnection conn = (HttpURLConnection) url.openConnection();

             conn.setRequestMethod("GET");
             conn.setRequestProperty("Content-Type", "application/json");
             conn.setRequestProperty("authorization", "Bearer " + token);
             conn.setRequestProperty("appKey", apiKey);
             conn.setRequestProperty("appSecret", apiSecret);
             conn.setRequestProperty("tr_id", "FHKST03010100");
             
             int responseCode = conn.getResponseCode();
             if (responseCode == HttpURLConnection.HTTP_OK) {
                 BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                 String inputLine;
                 
                 while ((inputLine = in.readLine()) != null) {
                     response.append(inputLine);
                 }
                 in.close();
               
                 JSONObject jsonResponse = new JSONObject(response.toString());
                 JSONArray output2Array = jsonResponse.getJSONArray("output2");
                 revchartData = new String[output2Array.length()][2];
                 
                 for (int i = 0; i < output2Array.length(); i++) {
                     JSONObject dayData = output2Array.getJSONObject(i);
                     revchartData[i][0] = dayData.getString("stck_bsop_date"); // 첫 번째 열에 영업일자 저장
                     revchartData[i][1] = dayData.getString("stck_clpr"); // 두 번째 열에 종가 저장
                 }
                 
                 List<String[]> revchartDataList = Arrays.asList(revchartData);
                 Collections.reverse(revchartDataList);
                 ChartData = revchartDataList.toArray(new String[0][]);
             } else if (responseCode == 500) { // 토큰 만료 시 재발급
                 new ConnectKIS().issueToken();
             } else {
                 System.out.println("Error Code: " + responseCode);
             }
         } catch (Exception e) {
             e.printStackTrace();
         }
//         return response.toString();
         return ChartData;
             
    }
    
// json 파일로 저장해놓는 함수
//    public void saveJsonToFile(String jsonData, String filePath) {
//        try (FileWriter file = new FileWriter(filePath)) {
//            file.write(jsonData);
//            file.flush();
//        } catch (IOException e) {
//            e.printStackTrace();
//        }
//    }         
    	
//파일 별 실생 원할 대 주석 풀기
//    public static void main(String[] args) {
//        GetapiData apiData = new GetapiData();
//        String priceData = apiData.LiveStockPrice("000660");
//       
//        if (priceData != null) {
//            System.out.println("정상 실행!");
//        } else {
//            System.out.println("Failed to retrieve stock price data.");
//        }
//        String[][] dailyData = apiData.DailyChartprice("000660");
//        if (dailyData != null) {
//            System.out.println("정상 실행!");
//            for (String[] row : dailyData) {
//        	    System.out.println(Arrays.toString(row));
//        	}
//        } else {
//            System.out.println("Failed to retrieve daily data.");
//        }
//    }
}