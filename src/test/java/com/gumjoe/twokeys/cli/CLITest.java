/**
 * Test file for CLI parser
 */
package com.gumjoe.twokeys.cli;

import com.gumjoe.twokeys.cli.CLI;
import org.apache.commons.cli.Options;
import org.junit.jupiter.api.Test;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.CoreMatchers.instanceOf;

public class CLITest {
    private CLI cli = new CLI();
    @Test public void checkInitOptions() {    
        Options init = this.cli.getInitOpts(); 
        assertThat(init, instanceOf(Options.class));
    }

    @Test public void checkOOBEOptions() {      
        Options oobe = this.cli.getOOBEOpts();
        assertThat(oobe, instanceOf(Options.class));
    }
}