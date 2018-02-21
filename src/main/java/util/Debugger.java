/**
 * Debug output for 2Keys
 */

public class Debugger {
    public static boolean isEnabled(){
        return true;
    }

    public static void log(Object out){
        if(Debugger.isEnabled()) {
            System.out.println("[DEBUG] " + out.toString());
        } 
    }
}