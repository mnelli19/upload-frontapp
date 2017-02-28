package it.sogei.upload;

import java.io.IOException;
import java.net.URL;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.cloudant.client.api.ClientBuilder;
import com.cloudant.client.api.CloudantClient;
import com.cloudant.client.api.Database;

/**
 * Servlet implementation class PrepareServlet
 */
@WebServlet("/prepare")
public class PrepareServlet extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public PrepareServlet() {
        super();
        // TODO Auto-generated constructor stub
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		
		// Create a new CloudantClient instance for account endpoint example.cloudant.com
		CloudantClient client = ClientBuilder.account("bee17896-df4a-4569-b79b-14ba0d2e21a2-bluemix:be6c67df3b06993c373f85126c21be362bcd165620e93cc010e5ea83b93aac34@bee17896-df4a-4569-b79b-14ba0d2e21a2-bluemix")
		                                     .username("bee17896-df4a-4569-b79b-14ba0d2e21a2-bluemix")
		                                     .password("be6c67df3b06993c373f85126c21be362bcd165620e93cc010e5ea83b93aac34")
		                                     .build();

		// Note: for Cloudant Local or Apache CouchDB use:
		// ClientBuilder.url(new URL("yourCloudantLocalAddress.example"))
//		              .username("exampleUser")
//		              .password("examplePassword")
//		              .build();

		// Show the server version
		System.out.println("Server Version: " + client.serverVersion());

		// Get a List of all the databases this Cloudant account
		List<String> databases = client.getAllDbs();
		System.out.println("All my databases : ");
		for ( String db : databases ) {
		    System.out.println(db);
		}

		// Working with data

		// Delete a database we created previously.
		//client.deleteDB("example_db");

		// Create a new database.
		//client.createDB("example_db");

		// Get a Database instance to interact with, but don't create it if it doesn't already exist
		Database db = client.database("nodejs-upload", false);
		
		String dbdata = "{ user: " + request.getAttribute("user") 
		    		+ ",\nname: " 
		    		+ request.getParameter("name") 
		    		+ ",\nuniqueIdentifier: " 
		    		+ request.getParameter("uniqueIdentifier") 
		    		+ ",\nusize: "
		    		+ request.getParameter("size") 
		    		+ "\n}";
		System.out.println("dbdata: "+dbdata);
		db.save(dbdata);
		
//		// A Java type that can be serialized to JSON
//		public class ExampleDocument {
//		  private String _id = "example_id";
//		  private String _rev = null;
//		  private boolean isExample;
//
//		  public ExampleDocument(boolean isExample) {
//		    this.isExample = isExample;
//		  }
//
//		  public String toString() {
//		    return "{ id: " + _id 
//		    		+ ",\nrev: " 
//		    		+ _rev + ",\nisExample: " 
//		    		+ isExample 
//		    		+ "\n}";
//		  }
//		}

		// Create an ExampleDocument and save it in the database
//		db.save(new ExampleDocument(true));
//		System.out.println("You have inserted the document");
//
//		// Get an ExampleDocument out of the database and deserialize the JSON into a Java type
//		ExampleDocument doc = db.find(ExampleDocument.class,"example_id");
//		System.out.println(doc);
		
		
	}

}
