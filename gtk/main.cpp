#include <stdio.h>
#include <sched.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <stdbool.h>
#include <pthread.h>
#include <gtk/gtk.h>

#include <chrono>
#include <thread>

#include "sim_board_micro.h"

#define COlOR_SCALE (0x10000/0x100)
#define SCREEN_IMAGE "screen"

GtkWidget* gImage = NULL;
GtkWidget* gScaledImage = NULL;

static void put_pixel(GdkPixbuf *pixbuf, int x, int y, uint32_t color)
{
    int width, height, rowstride, n_channels;
    guchar *pixels, *p;

    n_channels = gdk_pixbuf_get_n_channels(pixbuf);

    width = gdk_pixbuf_get_width(pixbuf);
    height = gdk_pixbuf_get_height(pixbuf);

    rowstride = gdk_pixbuf_get_rowstride(pixbuf);
    pixels = gdk_pixbuf_get_pixels(pixbuf);

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
        GdkPixbuf* buffer = gtk_image_get_pixbuf((GtkImage*)gImage);
        for(int j = 0; j < 8; j++)
        {
            int color = (call.spi & (1 << j)) == 0 ? 0x000000: 0xFFFFFF;
            put_pixel(buffer, X, Y+j, color);
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
}

bool GtkRunning = true;

void* simavr(void* obj)
{
    engineInit("atmega32u4");

    sleep(1);
    while(GtkRunning && fetchN(16000000))
    {
    }

    if(GtkRunning)
    {
        gtk_main_quit();
        GtkRunning = false;
    }

    return NULL;
}

void* refreshUI(void* obj)
{
    sleep(2);
    while(GtkRunning)
    {
        GdkPixbuf* buffer = gdk_pixbuf_scale_simple(gtk_image_get_pixbuf((GtkImage*)gImage), 256, 128, GDK_INTERP_NEAREST);
        gtk_image_set_from_pixbuf((GtkImage*)gScaledImage, buffer);
        gtk_widget_queue_draw(gScaledImage);
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

static void buttonHandler(GtkButton* button)
{
    int r, v;
    if(!strcmp(gtk_widget_get_name((GtkWidget*)button), "UP"))
    {
        r = 0x23;
        v = 0xEF;
    }
    if(!strcmp(gtk_widget_get_name((GtkWidget*)button), "R"))
    {
        r = 0x26;
        v = 0x80;
    }
    if(!strcmp(gtk_widget_get_name((GtkWidget*)button), "DOWN"))
    {
        r = 0x23;
        v = 0xBF;
    }
    if(!strcmp(gtk_widget_get_name((GtkWidget*)button), "L"))
    {
        r = 0x23;
        v = 0xDF;
    }
    if(!strcmp(gtk_widget_get_name((GtkWidget*)button), "A"))
    {
        r = 0x2F;
        v = 0x7F;
    }
    if(!strcmp(gtk_widget_get_name((GtkWidget*)button), "B"))
    {
        r = 0x2F;
        v = 0xBF;
    }
    buttonHit(r,v);
}

int main(int argc, char *argv[])
{
    FILE* executable = NULL;
    if(argc > 1) executable = fopen(argv[1],"rb");
    if(executable)
    {
        char buffer[1024];
        uint8_t unsignedBuffer[1024];
        while(fgets(buffer , 1024, executable) != NULL)
        {
            memcpy(unsignedBuffer, buffer, 1024);
            loadPartialProgram(unsignedBuffer);
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

    char linkBuffer[32];
    char pathBuffer[256];
    memset(pathBuffer, '\0', 256);
    sprintf(linkBuffer, "/proc/%d/exe", getpid());
    readlink(linkBuffer, pathBuffer, 256);

    char* temp = pathBuffer;
    char* found = strstr(pathBuffer, "/" );
    while(found != NULL)
    {
        temp += (found-temp);
        temp++;
        found = strstr(temp, "/" );
    }

    char screenPathBuffer[256];
    memset(screenPathBuffer, '\0', 256);
    int length = temp-pathBuffer;
    strncpy(screenPathBuffer, pathBuffer, length);
    strncpy(screenPathBuffer+length, SCREEN_IMAGE, strlen(SCREEN_IMAGE));
    gImage = gtk_image_new_from_file(screenPathBuffer);

    GdkPixbuf* buffer = gdk_pixbuf_scale_simple(gtk_image_get_pixbuf((GtkImage*)gImage), 256, 128, GDK_INTERP_NEAREST);
    gScaledImage = gtk_image_new_from_pixbuf(buffer);

    GtkWidget* horizontal_linear_layout0 = gtk_hbox_new(FALSE, 0);
    GtkWidget* blank_left = gtk_hbox_new(FALSE, 0);
    gtk_widget_set_size_request(blank_left, 44, 44);
    GtkWidget* up_button = gtk_button_new();
    gtk_widget_set_size_request(up_button, 44, 44);
    GtkWidget* blank_right = gtk_hbox_new(FALSE, 0);
    gtk_widget_set_size_request(blank_right, 168, 44);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout0), blank_left);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout0), up_button);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout0), blank_right);
    gtk_widget_set_name(up_button, "UP");
    g_signal_connect(up_button, "clicked", G_CALLBACK(buttonHandler), NULL);

    GtkWidget* horizontal_linear_layout = gtk_hbox_new(FALSE, 0);
    gtk_box_set_spacing((GtkBox*)horizontal_linear_layout, 44);

    GtkWidget* left_button = gtk_button_new();
    gtk_widget_set_size_request(left_button, 44, 44);
    GtkWidget* right_button = gtk_button_new();
    gtk_widget_set_size_request(right_button, 44, 44);
    GtkWidget* blank_right1 = gtk_hbox_new(FALSE, 0);
    gtk_widget_set_size_request(blank_right1, 80, 44);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout), left_button);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout), right_button);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout), blank_right1);
    gtk_widget_set_name(left_button, "L");
    g_signal_connect(left_button, "clicked", G_CALLBACK(buttonHandler), NULL);
    gtk_widget_set_name(right_button, "R");
    g_signal_connect(right_button, "clicked", G_CALLBACK(buttonHandler), NULL);

    GtkWidget* horizontal_linear_layout2 = gtk_hbox_new(FALSE, 0);
    GtkWidget* blank_left1 = gtk_hbox_new(FALSE, 0);
    gtk_widget_set_size_request(blank_left1, 44, 44);
    GtkWidget* down_button = gtk_button_new();
    gtk_widget_set_size_request(down_button, 44, 44);
    GtkWidget* blank_right2 = gtk_hbox_new(FALSE, 0);
    gtk_widget_set_size_request(blank_right2, 168, 44);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout2), blank_left1);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout2), down_button);
    gtk_container_add(GTK_CONTAINER(horizontal_linear_layout2), blank_right2);
    gtk_widget_set_name(down_button, "DOWN");
    g_signal_connect(down_button, "clicked", G_CALLBACK(buttonHandler), NULL);

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
    gtk_widget_set_name(a_button, "A");
    g_signal_connect(a_button, "clicked", G_CALLBACK(buttonHandler), NULL);
    gtk_widget_set_name(b_button, "B");
    g_signal_connect(b_button, "clicked", G_CALLBACK(buttonHandler), NULL);

    GtkWidget* parent_linear_layout = gtk_hbox_new(FALSE, 0);
    GtkWidget* vertical_linear_layout = gtk_vbox_new(FALSE, 15);

    gtk_box_pack_start(GTK_BOX(vertical_linear_layout), gScaledImage, FALSE, FALSE, 0);
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
    pthread_t refresh_thread;
    pthread_create(&simavr_thread, NULL, simavr, NULL);
    pthread_create(&refresh_thread, NULL, refreshUI, NULL);

    gtk_main();

    GtkRunning = false;

    pthread_join(simavr_thread, NULL);
    pthread_join(refresh_thread, NULL);

    return 0;
}
