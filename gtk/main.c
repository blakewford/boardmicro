#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdbool.h>
#include <pthread.h>
#include <gtk/gtk.h>

#include "sim_board_micro.h"

#define COlOR_SCALE (0x10000/0x100)

GtkWidget* gImage = NULL;

void loadPartialProgram(uint8_t* binary);
void engineInit(const char* m);
int32_t fetchN(int32_t n);

static void put_pixel(GdkPixbuf *pixbuf, int x, int y, uint32_t color)
{
    int width, height, rowstride, n_channels;
    guchar *pixels, *p;

    n_channels = gdk_pixbuf_get_n_channels (pixbuf);

    width = gdk_pixbuf_get_width (pixbuf);
    height = gdk_pixbuf_get_height (pixbuf);

    rowstride = gdk_pixbuf_get_rowstride (pixbuf);
    pixels = gdk_pixbuf_get_pixels (pixbuf);

    p = pixels + y * rowstride + x * n_channels;
    p[0] = (color >> 16) & 0xFF;
    p[1] = (color >> 8) & 0xFF;
    p[2] = color & 0xFF;
    p[3] = 0xFF;
}

int X=0, Y=0;
static void writeSPI(struct spiWrite call)
{
    if(call.ports[2] == 0x50)
    {
        for(int j = 0; j < 8; j++)
        {
            int color = (call.spi & (1 << j)) == 0 ? 0x000000: 0xFFFFFF;
            put_pixel(gtk_image_get_pixbuf((GtkImage*)gImage), X, Y+j, color);
        }
        if(++X == 128)
        {
            X = 0;
            Y += 8;
            if(Y == 64)
            {
                Y = 0;
            }
        }
    }
    gtk_widget_queue_draw(gImage);
}

bool GtkRunning = true;

void* simavr(void* obj)
{
    engineInit("atmega32u4");

    sleep(1);
    while(GtkRunning && fetchN(16000000))
    {
    }

    if(GtkRunning) gtk_main_quit();

    return NULL;
}

int main(int argc, char *argv[])
{
    FILE* executable = NULL;
    if(argc > 1) executable = fopen(argv[1],"rb");
    if(executable)
    {
        char buffer[1024];
        while(fgets(buffer , 1024, executable) != NULL)
        {
            loadPartialProgram(buffer);
        }
        fclose(executable);
    }
    else
    {
        return -1;
    }

    gtk_init(&argc, &argv);

    GtkWidget* layout = gtk_window_new(GTK_WINDOW_TOPLEVEL);
    gtk_window_set_position(GTK_WINDOW(layout), GTK_WIN_POS_CENTER);
    gtk_window_set_title(GTK_WINDOW(layout), "Arduboy");
    GdkColor color;
    color.red = 0x66*COlOR_SCALE;
    color.green = 0x00*COlOR_SCALE;
    color.blue = 0x33*COlOR_SCALE;
    gtk_widget_modify_bg(layout, GTK_STATE_NORMAL, &color);

    gImage = gtk_image_new_from_file("screen");

    GtkWidget* horizontal_linear_layout0 = gtk_hbox_new(FALSE, 0);
    GtkWidget* blank_left = gtk_hbox_new(FALSE, 0);
    gtk_widget_set_size_request(blank_left, 44, 44);
    GtkWidget* up_button = gtk_button_new();
    gtk_widget_set_size_request(up_button, 44, 44);
    GtkWidget* blank_right = gtk_hbox_new(FALSE, 0);
    gtk_widget_set_size_request(blank_right, 44, 44);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout0), blank_left);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout0), up_button);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout0), blank_right);

    GtkWidget* horizontal_linear_layout = gtk_hbox_new(FALSE, 0);
    gtk_box_set_spacing((GtkBox*)horizontal_linear_layout, 44);

    GtkWidget* left_button = gtk_button_new();
    gtk_widget_set_size_request(left_button, 44, 44);
    GtkWidget* right_button = gtk_button_new();
    gtk_widget_set_size_request(right_button, 44, 44);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout), left_button);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout), right_button);

    GtkWidget* horizontal_linear_layout2 = gtk_hbox_new(FALSE, 0);
    GtkWidget* blank_left1 = gtk_hbox_new(FALSE, 0);
    gtk_widget_set_size_request(blank_left1, 44, 44);
    GtkWidget* down_button = gtk_button_new();
    gtk_widget_set_size_request(down_button, 44, 44);
    GtkWidget* blank_right1 = gtk_hbox_new(FALSE, 0);
    gtk_widget_set_size_request(blank_right1, 44, 44);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout2), blank_left1);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout2), down_button);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout2), blank_right1);

    GtkWidget* horizontal_linear_layout3 = gtk_hbox_new(FALSE, 0);
    GtkWidget* blank_left2 = gtk_hbox_new(FALSE, 0);
    gtk_widget_set_size_request(blank_left2, 44, 44);
    GtkWidget* a_button = gtk_button_new();
    gtk_widget_set_size_request(a_button, 44, 44);
    GtkWidget* b_button = gtk_button_new();
    gtk_widget_set_size_request(b_button, 44, 44);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout3), blank_left2);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout3), a_button);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout3), b_button);

    GtkWidget* parent_linear_layout = gtk_hbox_new(FALSE, 0);
    GtkWidget* vertical_linear_layout = gtk_vbox_new(FALSE, 15);

    gtk_box_pack_start(GTK_BOX(vertical_linear_layout), gImage, FALSE, FALSE, 0);
    gtk_box_pack_start(GTK_BOX(vertical_linear_layout), horizontal_linear_layout0, FALSE, FALSE, 0);
    gtk_box_pack_start(GTK_BOX(vertical_linear_layout), horizontal_linear_layout, FALSE, FALSE, 0);
    gtk_box_pack_start(GTK_BOX(vertical_linear_layout), horizontal_linear_layout2, FALSE, FALSE, 0);
    gtk_box_pack_start(GTK_BOX(vertical_linear_layout), horizontal_linear_layout3, FALSE, FALSE, 0);

    gtk_box_pack_start(GTK_BOX(parent_linear_layout), vertical_linear_layout, FALSE, FALSE, 0);
    gtk_container_add(GTK_CONTAINER(layout), parent_linear_layout);

    g_signal_connect(G_OBJECT(layout), "destroy",
    G_CALLBACK(gtk_main_quit), NULL);

    gtk_widget_show_all(layout);

    setSPICallback(&writeSPI);

    pthread_t simavr_thread;
    pthread_create(&simavr_thread, NULL, simavr, NULL);

    gtk_main();

    GtkRunning = false;

    pthread_join(simavr_thread, NULL);

    return 0;
}
