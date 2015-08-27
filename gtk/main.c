#include <stdint.h>
#include <pthread.h>
#include <gtk/gtk.h>

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


void* simavr(void* obj)
{
  loadPartialProgram(":100000000C9456000C9473000C9473000C947300C1\n");
  loadPartialProgram(":100010000C9473000C9473000C9473000C94730094\n");
  loadPartialProgram(":100020000C9473000C9473000C9473000C94730084\n");
  loadPartialProgram(":100030000C9473000C9473000C9473000C94730074\n");
  loadPartialProgram(":100040000C9473000C9473000C9473000C94730064\n");
  loadPartialProgram(":100050000C9473000C9473000C9473000C94730054\n");
  loadPartialProgram(":100060000C9473000C9473000C9473000C94730044\n");
  loadPartialProgram(":100070000C9473000C9473000C9473000C94730034\n");
  loadPartialProgram(":100080000C9473000C9473000C9473000C94730024\n");
  loadPartialProgram(":100090000C9473000C9473000C9473000C94730014\n");
  loadPartialProgram(":1000A0000C9473000C9473000C94730011241FBE05\n");
  loadPartialProgram(":1000B000CFEFDAE0DEBFCDBF11E0A0E0B1E0EAEAC9\n");
  loadPartialProgram(":1000C000F1E002C005900D92A230B107D9F721E00E\n");
  loadPartialProgram(":1000D000A2E0B1E001C01D92A330B207E1F70E9497\n");
  loadPartialProgram(":1000E00075000C94D3000C940000CF93DF93CDB730\n");
  loadPartialProgram(":1000F000DEB7809100018093020184E290E028E065\n");
  loadPartialProgram(":10010000FC01208385E290E0FC01108285E290E012\n");
  loadPartialProgram(":1001100021E0FC01208385E290E022E0FC012083C5\n");
  loadPartialProgram(":1001200085E290E023E0FC01208385E290E024E07A\n");
  loadPartialProgram(":10013000FC01208385E290E025E0FC01208385E23C\n");
  loadPartialProgram(":1001400090E026E0FC01208385E290E027E0FC01BE\n");
  loadPartialProgram(":10015000208385E290E028E0FC01208385E290E0A6\n");
  loadPartialProgram(":1001600029E0FC01208385E290E02AE0FC01208365\n");
  loadPartialProgram(":1001700085E290E02BE0FC01208385E290E02CE01A\n");
  loadPartialProgram(":10018000FC01208385E290E02DE0FC01208385E2E4\n");
  loadPartialProgram(":1001900090E02EE0FC01208385E290E020910201B6\n");
  loadPartialProgram(":0A01A000FC012083AFCFF894FFCFDD\n");
  loadPartialProgram(":0201AA000F0044\n");
  loadPartialProgram(":00000001FF\n");

  engineInit("atmega32u4");
  int total = 0;
  while(total < 16000000)
  {
      fetchN(1000);
      total += 1000;
  }
  for(int i = 0; i < 64; i++)
  {
    for(int j = 0; j < 128; j++)
    {
      put_pixel(gtk_image_get_pixbuf((GtkImage*)gImage), j, i, 0x0000FF);
    }
  }
  gtk_widget_queue_draw(gImage); 

  return NULL;
}

int main(int argc, char *argv[])
{
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

  GtkWidget* horizontal_linear_layout = gtk_hbox_new(FALSE, 0);
  gtk_box_set_spacing((GtkBox*)horizontal_linear_layout, 44);

  GtkWidget* a_button = gtk_button_new_with_label("A");
  gtk_widget_set_size_request(a_button, 44, 44);
  GtkWidget* b_button = gtk_button_new_with_label("B");
  gtk_widget_set_size_request(b_button, 44, 44);
  gtk_container_add(GTK_CONTAINER(horizontal_linear_layout), a_button);
  gtk_container_add(GTK_CONTAINER(horizontal_linear_layout), b_button);

  GtkWidget* parent_linear_layout = gtk_hbox_new(FALSE, 0);
  GtkWidget* vertical_linear_layout = gtk_vbox_new(FALSE, 15);

  gtk_box_pack_start(GTK_BOX(vertical_linear_layout), gImage, FALSE, FALSE, 0);
  gtk_box_pack_start(GTK_BOX(vertical_linear_layout), horizontal_linear_layout, FALSE, FALSE, 0);

  gtk_box_pack_start(GTK_BOX(parent_linear_layout), vertical_linear_layout, FALSE, FALSE, 0);
  gtk_container_add(GTK_CONTAINER(layout), parent_linear_layout);

  g_signal_connect(G_OBJECT(layout), "destroy",
  G_CALLBACK(gtk_main_quit), NULL);

  gtk_widget_show_all(layout);

  pthread_t simavr_thread;
  pthread_create(&simavr_thread, NULL, simavr, NULL);

  gtk_main();

  pthread_join(simavr_thread, NULL);

  return 0;
}
