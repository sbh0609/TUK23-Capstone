package utility;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import org.json.JSONObject;

public class ConnectKIS {
    private String apiKey = System.getenv("KISAPP_KEY");
    private String apiSecret = System.getenv("KISSECRET_KEY");
    private String baseUrl = "https://openapi.koreainvestment.com:9443";

   
    public void issueToken() {
        try {
        	// api 토큰 발급을 위해 URL 객체 생성
            URL url = new URL(baseUrl + "/oauth2/tokenP");
            // URL로 객체 초기화
            HttpURLConnection con = (HttpURLConnection) url.openConnection();
            //post 메서드 사용
            con.setRequestMethod("POST");
            con.setRequestProperty("Content-Type", "application/json");
            //POST 요청에 데이터를 전송할 수 있도록 합니다.
            con.setDoOutput(true);
            
            //JSON 형식의 문자열 생성 후 api 와 secret으로 토큰 요청 
            String jsonInputString = "{\"grant_type\": \"client_credentials\", \"appkey\": \"" + apiKey + "\", \"appsecret\": \"" + apiSecret + "\"}";
           
            try (DataOutputStream wr = new DataOutputStream(con.getOutputStream())) {
                wr.writeBytes(jsonInputString);
                wr.flush();
            }

            //서버로부터 받은 http 응답 코드 확인 
            int responseCode = con.getResponseCode();
            System.out.println("POST Response Code :: " + responseCode);
            
            if (responseCode == HttpURLConnection.HTTP_OK) { //success
                BufferedReader in = new BufferedReader(new InputStreamReader(con.getInputStream()));
                String inputLine;
                StringBuffer response = new StringBuffer();

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }
                in.close();
                
                
                JSONObject jsonObject = new JSONObject(response.toString());
                System.out.println(response.toString());
                String token = jsonObject.getString("access_token");
                
                try (FileWriter writer = new FileWriter("token.dat")) {
                    writer.write(token);
                    System.out.println("Token saved to file.");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            } else {
                System.out.println("POST request not worked");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    public String readTokenFromFile() {
        try (BufferedReader reader = new BufferedReader(new FileReader("token.dat"))) {
            return reader.readLine(); // 첫 번째 줄에 토큰이 저장되어 있다고 가정
        } catch (IOException e) {
        	// 파일을 찾을 수 없을 때 issueToken 메소드를 호출하여 토큰을 재발급
            issueToken();
            // 재발급 후 다시 파일을 읽어서 반환
            try (BufferedReader reader = new BufferedReader(new FileReader("token.dat"))) {
                return reader.readLine();
            } catch (IOException ex) {
                ex.printStackTrace();
                return null; // 재시도 후에도 실패하면 null 반환
            }
        }
    }
  //파일 별 실생 원할 대 주석 풀기
//    public static void main(String[] args) {
//        ConnectKIS connectKIS = new ConnectKIS();
//        connectKIS.issueToken();
//    }
}

